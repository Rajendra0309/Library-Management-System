const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/reports/dashboard
// @desc    Get aggregated stats for dashboard
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin', 'librarian'), reportController.getDashboardData);

module.exports = router;
