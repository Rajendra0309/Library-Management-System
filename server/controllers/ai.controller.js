const axios = require('axios');

// Proxy request to the Python Flask AI Service
const getRecommendations = async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "memberId is required for recommendations"
      });
    }

    // Call the internal Flask AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    
    try {
      const response = await axios.post(`${aiServiceUrl}/api/ai/recommend`, {
        memberId
      });

      return res.status(200).json(response.data);
    } catch (aiError) {
      console.error("Error communicating with AI service:", aiError.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch recommendations from AI service",
        error: aiError.message
      });
    }

  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations
};
