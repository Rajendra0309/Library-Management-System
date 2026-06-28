const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  changePassword, 
  getSecurityQuestion, 
  verifySecurityAnswer, 
  verifyOtp, 
  resetPassword,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  forgotPasswordSendOtp
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Password validation rule (reusable)
const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
  .matches(/\d/).withMessage('Password must contain at least one number.')
  .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/).withMessage('Password must contain at least one special character.');

/**
 * @route   POST /api/auth/send-verification-otp
 * @desc    Send OTP to email during registration
 * @access  Public
 */
router.post('/send-verification-otp', sendRegistrationOtp);

/**
 * @route   POST /api/auth/verify-registration-otp
 * @desc    Verify OTP during registration
 * @access  Public
 */
router.post('/verify-registration-otp', verifyRegistrationOtp);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new member account
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.').toLowerCase().trim()
      .custom((value) => {
        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        const domain = value.split('@')[1]?.toLowerCase();
        if (!domain) return false;
        if (allowedDomains.includes(domain)) return true;
        if (domain.endsWith('.ac.in') || domain.endsWith('.edu.in')) return true;
        throw new Error('Only standard email providers or Indian college domains (.ac.in, .edu.in) are allowed.');
      }),
    passwordRules,
    body('phone').trim().notEmpty().withMessage('Phone number is required.').matches(/^\+[1-9]\d{1,14}$/).withMessage('Please provide a valid phone number with country code (e.g., +91).')
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
    body('email').isEmail().withMessage('Please provide a valid email address.').toLowerCase().trim(),
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
 * @route   POST /api/auth/forgot-password/send-otp
 * @desc    Send OTP to email for password reset
 * @access  Public
 */
router.post('/forgot-password/send-otp', forgotPasswordSendOtp);

/**
 * @route   POST /api/auth/forgot-password/verify-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
router.post('/forgot-password/verify-otp', verifyOtp);

/**
 * @route   POST /api/auth/forgot-password/question
 * @desc    Fetch security question for a given email
 * @access  Public
 */
router.post('/forgot-password/question', getSecurityQuestion);

/**
 * @route   POST /api/auth/forgot-password/verify-answer
 * @desc    Verify security answer. Returns resetToken on success
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
 * @route   POST /api/auth/forgot-password/reset
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post(
  '/forgot-password/reset',
  [
    body('resetToken').notEmpty().withMessage('Reset token is required.'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
      .matches(/\d/).withMessage('New password must contain at least one number.')
      .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;'/]/).withMessage('New password must contain at least one special character.')
  ],
  resetPassword
);

module.exports = router;
