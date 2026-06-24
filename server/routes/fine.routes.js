const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fine.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Serverless Cron Webhook - Unprotected by JWT, but uses x-api-key
router.post('/trigger-cron', fineController.triggerCron);

// All fine routes are protected
router.use(protect);

// Get all fines - Librarian/Admin only
router.get('/', authorize('librarian', 'admin'), fineController.getFines);

// Get fine summary - Admin/Librarian
router.get('/summary', authorize('admin', 'librarian'), fineController.getFineSummary);

// Get fines for a specific member
router.get('/:memberId', fineController.getMemberFines);

// Mark fine as paid - Librarian/Admin
router.put('/pay/:id', authorize('librarian', 'admin'), fineController.payFine);

// Waive fine - Admin only
router.put('/waive/:id', authorize('admin'), fineController.waiveFine);

module.exports = router;
