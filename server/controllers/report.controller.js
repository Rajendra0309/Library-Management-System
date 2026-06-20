const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard report data
const getDashboardData = async (req, res) => {
  try {
    // Fetch the latest report from the ETL pipeline
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
