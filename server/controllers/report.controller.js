const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard report data
const getDashboardData = async (req, res) => {
  try {
    // If user is a librarian, calculate real-time stats for their specific city
    if (req.user && req.user.role === 'librarian' && req.user.city) {
      const city = req.user.city;
      
      const [totalBooks, totalMembers, activeBorrows, overdueBorrows, totalFinesAgg] = await Promise.all([
        prisma.book.count({ where: { city } }),
        prisma.user.count({ where: { role: 'member', city } }),
        prisma.borrow.count({ where: { status: 'active', book: { city } } }),
        prisma.borrow.count({ where: { status: 'active', dueDate: { lt: new Date() }, book: { city } } }),
        prisma.fine.aggregate({ _sum: { amount: true }, where: { borrow: { book: { city } } } })
      ]);

      const data = {
        totalBooks,
        totalMembers,
        activeBorrows,
        overdueBorrows,
        totalFines: totalFinesAgg._sum.amount || 0,
        genreStats: {},
        borrowingTrends: []
      };

      return res.status(200).json({
        success: true,
        message: "City-specific report data fetched successfully",
        data
      });
    }

    // For Admins (or if no city is set), fetch the latest global report from the ETL pipeline
    const latestReport = await prisma.report.findFirst({
      orderBy: {
        date: 'desc'
      }
    });

    if (!latestReport) {
      // Return empty state matching the schema
      return res.status(200).json({
        success: true,
        message: "No report data found",
        data: {
          totalBooks: 0,
          totalMembers: 0,
          activeBorrows: 0,
          overdueBorrows: 0,
          totalFines: 0,
          genreStats: {},
          borrowingTrends: []
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report data fetched successfully",
      data: latestReport
    });
  } catch (error) {
    console.error("Report Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  getDashboardData
};
