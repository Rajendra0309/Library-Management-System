const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// @route   GET /api/reports/dashboard
// @desc    Get aggregated stats for dashboard
// @access  Private/Admin
router.get('/dashboard', reportController.getDashboardData);

module.exports = router;
