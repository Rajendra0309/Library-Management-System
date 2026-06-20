const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrow.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All borrow routes are protected
router.use(protect);

// Issue book - Librarian/Admin only
router.post('/issue', authorize('librarian', 'admin'), borrowController.issueBook);

// Return book - Librarian/Admin only
router.post('/return/:id', authorize('librarian', 'admin'), borrowController.returnBook);

// Renew book - Member/Librarian/Admin
// Members can renew their own books (checked in controller if needed, but PRD says librarian issues/returns, renewal might be librarian lead too or member self-service)
// PRD says FR-04: librarian issues book. Renewal rules apply. 
router.put('/renew/:id', borrowController.renewBook);

// Get active borrows - Librarian/Admin only
router.get('/active', authorize('librarian', 'admin'), borrowController.getActiveBorrows);

// Get overdue borrows - Librarian/Admin only
router.get('/overdue', authorize('librarian', 'admin'), borrowController.getOverdueBorrows);

// Get member borrow history
router.get('/history/:memberId', borrowController.getBorrowHistory);

module.exports = router;
