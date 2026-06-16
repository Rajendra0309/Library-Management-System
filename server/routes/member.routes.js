const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  updateMemberStatus,
  getMemberHistory
} = require('../controllers/member.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect all routes under this router
router.use(protect);

// Routes accessible by Librarian and Admin
router.route('/')
  .get(authorize('admin', 'librarian'), getMembers)
  .post(authorize('admin', 'librarian'), createMember);

// Routes that can be accessed by self, librarian, or admin
router.route('/:id')
  .get(getMemberById)
  .put(updateMember)
  .delete(authorize('admin'), deleteMember); // Delete is admin-only

// Status update (Librarian/Admin only)
router.put('/:id/status', authorize('admin', 'librarian'), updateMemberStatus);

// Borrowing history (Self or Librarian/Admin)
router.get('/:id/history', getMemberHistory);

module.exports = router;
