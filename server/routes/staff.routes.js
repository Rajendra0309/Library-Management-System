const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/staff.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All staff routes require authentication AND admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET  /api/staff
 * @route   POST /api/staff
 * @access  Admin only
 */
router.route('/')
  .get(getStaff)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required.'),
      body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
      body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
        .matches(/\d/).withMessage('Password must contain at least one number.')
        .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/).withMessage('Password must contain at least one special character.'),
      body('role')
        .isIn(['admin', 'librarian']).withMessage('Role must be either admin or librarian.'),
      body('department').optional().trim(),
      body('employeeId').optional().trim()
    ],
    createStaff
  );

/**
 * @route   GET    /api/staff/:id
 * @route   PUT    /api/staff/:id
 * @route   DELETE /api/staff/:id
 * @access  Admin only
 */
router.route('/:id')
  .get(getStaffById)
  .put(
    [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
      body('role').optional().isIn(['admin', 'librarian']).withMessage('Role must be admin or librarian.'),
      body('department').optional().trim(),
      body('employeeId').optional().trim(),
      body('status').optional().isIn(['active', 'suspended']).withMessage('Status must be active or suspended.')
    ],
    updateStaff
  )
  .delete(deleteStaff);

module.exports = router;
