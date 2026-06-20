const prisma = require("../prisma/client");

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
