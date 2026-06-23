const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/ai/recommend
// @desc    Get book recommendations for a member
// @access  Private (Assume token validation handled by middleware in higher levels if needed)
router.post('/recommend', protect, aiController.getRecommendations);

module.exports = router;
