const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard report data
const getDashboardData = async (req, res) => {
  try {
    // If user is a librarian, calculate real-time stats for their specific city
    if (req.user && req.user.role === 'librarian' && req.user.city) {
      const city = req.user.city;
      
      const [totalBooks, totalMembers, activeBorrows, overdueBorrows, totalFinesAgg, allCityBooks] = await Promise.all([
        prisma.book.count({ where: { city } }),
        prisma.user.count({ where: { role: 'member', city } }),
        prisma.borrow.count({ where: { status: 'active', book: { city } } }),
        prisma.borrow.count({ where: { status: 'active', dueDate: { lt: new Date() }, book: { city } } }),
        prisma.fine.aggregate({ _sum: { amount: true }, where: { borrow: { book: { city } } } }),
        prisma.book.findMany({ where: { city }, select: { genre: true } })
      ]);

      const genreStats = {};
      allCityBooks.forEach(b => {
        if (b.genre) {
          const g = b.genre;
          genreStats[g] = (genreStats[g] || 0) + 1;
        }
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentBorrows = await prisma.borrow.findMany({
        where: { book: { city }, issueDate: { gte: sevenDaysAgo } },
        select: { issueDate: true }
      });

      const trendsMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendsMap[dateStr] = 0;
      }
      recentBorrows.forEach(b => {
        const dateStr = new Date(b.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trendsMap[dateStr] !== undefined) trendsMap[dateStr]++;
      });
      const borrowingTrends = Object.keys(trendsMap).map(date => ({
        date,
        borrows: trendsMap[date]
      }));

      const data = {
        totalBooks,
        totalMembers,
        activeBorrows,
        overdueBorrows,
        totalFines: totalFinesAgg._sum.amount || 0,
        genreStats,
        borrowingTrends
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
