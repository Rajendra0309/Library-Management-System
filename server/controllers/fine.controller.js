const prisma = require("../prisma/client");
const { sendDueSoonEmail, sendOverdueFineEmail } = require("../utils/mailer");

/*
=====================================
Get All Fines
GET /api/fines
=====================================
*/
exports.getFines = async (req, res) => {
    try {
        const { status } = req.query;
        const filters = {};
        if (status) filters.status = status;

        // If librarian, only show fines for members in their city
        if (req.user && req.user.role === 'librarian' && req.user.city) {
            filters.member = {
                city: req.user.city
            };
        }

        const fines = await prisma.fine.findMany({
            where: filters,
            include: {
                member: { select: { name: true, email: true, membershipId: true } },
                borrow: { include: { book: { select: { title: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            count: fines.length,
            data: fines,
        });
    } catch (error) {
        console.error("Get Fines Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Get Member Fines
GET /api/fines/:memberId
=====================================
*/
exports.getMemberFines = async (req, res) => {
    try {
        const { memberId } = req.params;

        const fines = await prisma.fine.findMany({
            where: { memberId },
            include: {
                member: { select: { name: true, email: true, membershipId: true } },
                borrow: { include: { book: { select: { title: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            count: fines.length,
            data: fines,
        });
    } catch (error) {
        console.error("Get Member Fines Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Pay Fine
PUT /api/fines/pay/:id
=====================================
*/
exports.payFine = async (req, res) => {
    try {
        const { id } = req.params;

        const fine = await prisma.fine.findUnique({
            where: { id },
        });

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine record not found",
            });
        }

        if (fine.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Fine is already ${fine.status}`,
            });
        }

        const updatedFine = await prisma.fine.update({
            where: { id },
            data: {
                status: "paid",
                paidAt: new Date(),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Fine marked as paid successfully",
            data: updatedFine,
        });
    } catch (error) {
        console.error("Pay Fine Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Waive Fine
PUT /api/fines/waive/:id
=====================================
*/
exports.waiveFine = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Reason is mandatory for waiving a fine",
            });
        }

        const fine = await prisma.fine.findUnique({
            where: { id },
        });

        if (!fine) {
            return res.status(404).json({
                success: false,
                message: "Fine record not found",
            });
        }

        if (fine.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Fine is already ${fine.status}`,
            });
        }

        const updatedFine = await prisma.fine.update({
            where: { id },
            data: {
                status: "waived",
                waivedBy: req.user.id, // Set the admin's ID
                reason,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Fine waived successfully",
            data: updatedFine,
        });
    } catch (error) {
        console.error("Waive Fine Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Get Fine Summary
GET /api/fines/summary
=====================================
*/
exports.getFineSummary = async (req, res) => {
    try {
        const summary = await prisma.fine.groupBy({
            by: ['status'],
            _sum: {
                amount: true
            },
            _count: {
                id: true
            }
        });

        return res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        console.error("Fine Summary Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/*
=====================================
Trigger Cron For Fines
POST /api/fines/trigger-cron
=====================================
*/
exports.triggerCron = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        
        if (!process.env.CRON_SECRET_KEY || apiKey !== process.env.CRON_SECRET_KEY) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid or missing API Key",
            });
        }

        const { calculateFineAmount } = require('../utils/fineCalculator');
        const today = new Date();

        const overdueBorrows = await prisma.borrow.findMany({
            where: {
                status: 'active',
                dueDate: { lt: today }
            },
            include: {
                member: true,
                book: true
            }
        });

        let updated = 0;
        let created = 0;

        for (const borrow of overdueBorrows) {
            const diffInTime = today.getTime() - new Date(borrow.dueDate).getTime();
            const daysOverdue = Math.ceil(diffInTime / (1000 * 3600 * 24));

            if (daysOverdue > 0) {
                const fineAmount = calculateFineAmount(daysOverdue);

                const existingFine = await prisma.fine.findFirst({
                    where: {
                        borrowId: borrow.id,
                        status: 'pending'
                    }
                });

                if (existingFine) {
                    await prisma.fine.update({
                        where: { id: existingFine.id },
                        data: {
                            amount: fineAmount,
                            daysOverdue: daysOverdue
                        }
                    });
                    updated++;
                } else {
                    await prisma.fine.create({
                        data: {
                            amount: fineAmount,
                            daysOverdue: daysOverdue,
                            memberId: borrow.memberId,
                            borrowId: borrow.id,
                            status: 'pending'
                        }
                    });
                    created++;
                    
                    // Send notification and email for newly generated fine (first day overdue)
                    await prisma.notification.create({
                        data: {
                            userId: borrow.memberId,
                            type: "FINE",
                            title: "Overdue Book Fine",
                            message: `Your borrowed book "${borrow.book.title}" is overdue by ${daysOverdue} day(s). A fine of Rs ${fineAmount} has been applied.`
                        }
                    });
                    sendOverdueFineEmail(borrow.member.email, borrow.member.name, borrow.book.title, fineAmount, borrow.dueDate).catch(console.error);
                }
            }
        }

        // --- Handle Due Soon (Due tomorrow) ---
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStart = new Date(tomorrow.setHours(0,0,0,0));
        const tomorrowEnd = new Date(tomorrow.setHours(23,59,59,999));

        const dueSoonBorrows = await prisma.borrow.findMany({
            where: {
                status: 'active',
                dueDate: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd
                }
            },
            include: {
                member: true,
                book: true
            }
        });

        let dueSoonCount = 0;
        for (const borrow of dueSoonBorrows) {
            // Check if notification already sent to avoid duplicates if cron runs multiple times a day
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    userId: borrow.memberId,
                    type: "REMINDER",
                    message: {
                        contains: borrow.book.title
                    },
                    createdAt: {
                        gte: new Date(today.setHours(0,0,0,0))
                    }
                }
            });

            if (!existingNotification) {
                await prisma.notification.create({
                    data: {
                        userId: borrow.memberId,
                        type: "REMINDER",
                        title: "Book Due Soon",
                        message: `Reminder: The book "${borrow.book.title}" is due tomorrow.`
                    }
                });
                sendDueSoonEmail(borrow.member.email, borrow.member.name, borrow.book.title, borrow.dueDate).catch(console.error);
                dueSoonCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: "Fines and reminders processed successfully via Webhook",
            stats: { overdueBorrows: overdueBorrows.length, finesCreated: created, finesUpdated: updated, dueSoonRemindersSent: dueSoonCount }
        });

    } catch (error) {
        console.error("Trigger Cron Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during fine processing",
        });
    }
};
