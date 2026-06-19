const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, getMe, changePassword, getSecurityQuestion, verifySecurityAnswer, verifyOtp, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Password validation rule (reusable)
const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
  .matches(/\d/).withMessage('Password must contain at least one number.')
  .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/).withMessage('Password must contain at least one special character.');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new member account
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
    passwordRules,
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number.')
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user profile
 * @access  Protected
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change the authenticated user's password
 * @access  Protected
 */
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
      .matches(/\d/).withMessage('New password must contain at least one number.')
      .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/).withMessage('New password must contain at least one special character.')
  ],
  changePassword
);


// ─── Forgot Password Flow ─────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/forgot-password/question
 * @desc    Fetch security question for a given email
 * @access  Public
 */
router.post('/forgot-password/question', getSecurityQuestion);

/**
 * @route   POST /api/auth/forgot-password/verify-answer
 * @desc    Verify security answer. Returns resetToken on success, OTP on failure.
 * @access  Public
 */
router.post(
  '/forgot-password/verify-answer',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('securityAnswer').trim().notEmpty().withMessage('Security answer is required.')
  ],
  verifySecurityAnswer
);

/**
 * @route   POST /api/auth/forgot-password/verify-otp
 * @desc    Verify the on-screen OTP. Returns resetToken on success.
 * @access  Public
 */
router.post(
  '/forgot-password/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.')
  ],
  verifyOtp
);

/**
 * @route   POST /api/auth/forgot-password/reset
 * @desc    Reset password using a valid resetToken
 * @access  Public
 */
router.post(
  '/forgot-password/reset',
  [
    body('resetToken').notEmpty().withMessage('Reset token is required.'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
      .matches(/\d/).withMessage('Password must contain at least one number.')
      .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/).withMessage('Password must contain at least one special character.')
  ],
  resetPassword
);

module.exports = router;
