const prisma = require("../prisma/client");
const { calculateFineAmount } = require("../utils/fineCalculator");
const { sendBorrowEmail, sendReturnEmail, sendOverdueFineEmail } = require("../utils/mailer");

/*
=====================================
Issue Book
POST /api/borrow/issue
=====================================
*/
exports.issueBook = async (req, res) => {
    try {
        const { memberId, bookId } = req.body;

        if (!memberId || !bookId) {
            return res.status(400).json({
                success: false,
                message: "Member ID and Book ID are required",
            });
        }

        // 1. Check if member exists and status is active
        const member = await prisma.user.findUnique({
            where: { id: memberId },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        if (member.status !== "active") {
            return res.status(403).json({
                success: false,
                message: `Member account is ${member.status}. Cannot borrow books.`,
            });
        }

        // Get system config
        let config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
        if (!config) {
            config = { maxBorrows: 5, loanPeriod: 14 };
        }

        // 2. Check active borrow limit
        const activeBorrowsCount = await prisma.borrow.count({
            where: {
                memberId,
                status: "active",
            },
        });

        if (activeBorrowsCount >= config.maxBorrows) {
            return res.status(400).json({
                success: false,
                message: `Maximum borrow limit reached (${config.maxBorrows} books)`,
            });
        }

        // 3. Check unpaid fines (Max Rs 100 total)
        const totalUnpaidFines = await prisma.fine.aggregate({
            where: {
                memberId,
                status: "pending",
            },
            _sum: {
                amount: true,
            },
        });

        const unpaidAmount = totalUnpaidFines._sum.amount || 0;
        if (unpaidAmount > 100) {
            return res.status(403).json({
                success: false,
                message: `Cannot borrow, unpaid fines exceed Rs 100 (Current: Rs ${unpaidAmount})`,
            });
        }

        // 4. Check book availability
        const book = await prisma.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({
                success: false,
                message: "Book is currently unavailable",
            });
        }

        // 5. Issue book (Transaction)
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(issueDate.getDate() + (config.loanPeriod || 14));

        const borrow = await prisma.$transaction(async (tx) => {
            // Atomically check and update book availability
            const updateResult = await tx.book.updateMany({
                where: { id: bookId, availableCopies: { gt: 0 } },
                data: {
                    availableCopies: { decrement: 1 },
                    timesBorrowed: { increment: 1 },
                },
            });

            if (updateResult.count === 0) {
                throw new Error("ConcurrencyError: Book is no longer available");
            }

            // Create borrow record
            const newBorrow = await tx.borrow.create({
                data: {
                    memberId,
                    bookId,
                    issueDate,
                    dueDate,
                    status: "active",
                },
            });

            // Create notification
            await tx.notification.create({
                data: {
                    userId: memberId,
                    type: "BORROW",
                    title: "Book Borrowed",
                    message: `You have successfully borrowed "${book.title}". It is due on ${dueDate.toLocaleDateString()}.`
                }
            });

            return newBorrow;
        });

        // Send email asynchronously
        sendBorrowEmail(member.email, member.name, book.title, dueDate).catch(console.error);

        return res.status(201).json({
            success: true,
            message: "Book issued successfully",
            data: borrow,
        });
    } catch (error) {
        console.error("Issue Book Error:", error);
        
        if (error.message && error.message.includes("ConcurrencyError")) {
             return res.status(409).json({
                 success: false,
                 message: "Book is no longer available (borrowed by another user just now).",
             });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/*
=====================================
Return Book
POST /api/borrow/return/:id
=====================================
*/
exports.returnBook = async (req, res) => {
    try {
        const { id } = req.params;

        const borrow = await prisma.borrow.findUnique({
            where: { id },
            include: { book: true, member: true },
        });

        if (!borrow) {
            return res.status(404).json({
                success: false,
                message: "Borrow record not found",
            });
        }

        if (borrow.status === "returned") {
            return res.status(400).json({
                success: false,
                message: "Book already returned",
            });
        }

        const returnDate = new Date();
        const isOverdue = returnDate > borrow.dueDate;
        let fine = null;

        if (isOverdue) {
            const daysOverdue = Math.ceil((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24));
            const amount = calculateFineAmount(daysOverdue);

            if (amount > 0) {
                fine = {
                    amount,
                    daysOverdue,
                    memberId: borrow.memberId,
                    borrowId: borrow.id,
                    status: "pending",
                };
            }
        }

        const updatedBorrow = await prisma.$transaction(async (tx) => {
            // Update borrow record
            const result = await tx.borrow.update({
                where: { id },
                data: {
                    returnDate,
                    status: "returned",
                },
            });

            // Update book availability
            await tx.book.update({
                where: { id: borrow.bookId },
                data: {
                    availableCopies: { increment: 1 },
                },
            });

            // Create fine if overdue
            if (fine) {
                await tx.fine.create({ data: fine });
            }

            // Create notification
            await tx.notification.create({
                data: {
                    userId: borrow.memberId,
                    type: fine ? "FINE" : "RETURN",
                    title: "Book Returned",
                    message: fine ? `You returned "${borrow.book.title}" late. A fine of Rs ${fine.amount} has been added.` : `You have successfully returned "${borrow.book.title}".`
                }
            });

            return result;
        });

        // Send Emails asynchronously
        sendReturnEmail(borrow.member.email, borrow.member.name, borrow.book.title).catch(console.error);
        if (fine) {
            sendOverdueFineEmail(borrow.member.email, borrow.member.name, borrow.book.title, fine.amount, borrow.dueDate).catch(console.error);
        }

        return res.status(200).json({
            success: true,
            message: isOverdue ? "Book returned overdue. Fine generated." : "Book returned successfully",
            data: updatedBorrow,
        });
    } catch (error) {
        console.error("Return Book Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/*
=====================================
Renew Book
PUT /api/borrow/renew/:id
=====================================
*/
exports.renewBook = async (req, res) => {
    try {
        const { id } = req.params;

        const borrow = await prisma.borrow.findUnique({
            where: { id },
            include: { book: true },
        });

        if (!borrow) {
            return res.status(404).json({
                success: false,
                message: "Borrow record not found",
            });
        }

        if (borrow.status !== "active") {
            return res.status(400).json({
                success: false,
                message: `Cannot renew. Borrow status is ${borrow.status}`,
            });
        }

        // 1. Check max renewals (Max 2)
        if (borrow.renewalCount >= 2) {
            return res.status(400).json({
                success: false,
                message: "Maximum renewals reached",
            });
        }

        // 2. Check if already overdue
        if (new Date() > borrow.dueDate) {
            return res.status(400).json({
                success: false,
                message: "Cannot renew, book is already overdue",
            });
        }

        // 3. Check if reserved by another member
        const reservation = await prisma.reservation.findFirst({
            where: {
                bookId: borrow.bookId,
                status: "pending",
                memberId: { not: borrow.memberId },
            },
        });

        if (reservation) {
            return res.status(400).json({
                success: false,
                message: "Cannot renew, book is reserved by another member",
            });
        }

        // 4. Extend due date (+ 7 days)
        const newDueDate = new Date(borrow.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 7);

        const updatedBorrow = await prisma.borrow.update({
            where: { id },
            data: {
                dueDate: newDueDate,
                renewalCount: { increment: 1 },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Book renewed successfully",
            data: updatedBorrow,
        });
    } catch (error) {
        console.error("Renew Book Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/*
=====================================
Get Active Borrows
GET /api/borrow/active
=====================================
*/
exports.getActiveBorrows = async (req, res) => {
    try {
        const where = { status: "active" };
        if (req.user && req.user.role === 'librarian' && req.user.city) {
            where.book = { city: req.user.city };
        }

        const borrows = await prisma.borrow.findMany({
            where,
            include: {
                book: { select: { title: true, author: true, isbn: true, city: true, libraryName: true } },
                member: { select: { name: true, email: true, membershipId: true } },
            },
            orderBy: { dueDate: "asc" },
        });

        return res.status(200).json({
            success: true,
            count: borrows.length,
            data: borrows,
        });
    } catch (error) {
        console.error("Get Active Borrows Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Get Overdue Borrows
GET /api/borrow/overdue
=====================================
*/
exports.getOverdueBorrows = async (req, res) => {
    try {
        const where = {
            status: "active",
            dueDate: { lt: new Date() },
        };
        
        if (req.user && req.user.role === 'librarian' && req.user.city) {
            where.book = { city: req.user.city };
        }

        const borrows = await prisma.borrow.findMany({
            where,
            include: {
                book: { select: { title: true, author: true, isbn: true, city: true, libraryName: true } },
                member: { select: { name: true, email: true, membershipId: true } },
            },
            orderBy: { dueDate: "asc" },
        });

        return res.status(200).json({
            success: true,
            count: borrows.length,
            data: borrows,
        });
    } catch (error) {
        console.error("Get Overdue Borrows Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Get Member Borrow History
GET /api/borrow/history/:memberId
=====================================
*/
exports.getBorrowHistory = async (req, res) => {
    try {
        const { memberId } = req.params;

        const borrows = await prisma.borrow.findMany({
            where: { memberId },
            include: {
                book: { select: { title: true, author: true, isbn: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            count: borrows.length,
            data: borrows,
        });
    } catch (error) {
        console.error("Get Borrow History Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
