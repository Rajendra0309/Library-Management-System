const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { generateMembershipId } = require('../utils/membershipId');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a signed JWT token for a user ID
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * @desc    Register a new member
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((e) => e.msg).join(', ')
      });
    }

    const { name, email, password, phone } = req.body;

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
        error: 'Duplicate email'
      });
    }

    // Hash password (bcrypt salt rounds: 12 per PRD security spec)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique membership ID (LMS-YYYY-XXXX)
    const membershipId = await generateMembershipId();

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'member',
        status: 'active',
        membershipId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        membershipId: true,
        status: true,
        createdAt: true
      }
    });

    const token = signToken(user.id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to LibraVault!',
      data: { token, user }
    });
  } catch (error) {
    console.error('[auth.controller] register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Login user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((e) => e.msg).join(', ')
      });
    }

    const { email, password } = req.body;

    // Find user (include password and lockout fields for this check)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        membershipId: true,
        status: true,
        password: true,
        loginAttempts: true,
        lockUntil: true,
        profileImage: true,
        createdAt: true
      }
    });

    // User not found — return generic message to prevent email enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: 'Invalid credentials'
      });
    }

    // Check if account is currently locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account is locked due to too many failed attempts. Please try again in ${minutesLeft} minute(s).`,
        error: 'Account locked'
      });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact an administrator.',
        error: 'Account suspended'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment login attempts
      const newAttempts = (user.loginAttempts || 0) + 1;
      const isNowLocked = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          ...(isNowLocked && { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) })
        }
      });

      if (isNowLocked) {
        return res.status(403).json({
          success: false,
          message: 'Account locked for 15 minutes due to 3 failed login attempts.',
          error: 'Account locked'
        });
      }

      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${attemptsRemaining} attempt(s) remaining before account lockout.`,
        error: 'Invalid credentials'
      });
    }

    // Success — reset lockout counters
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null }
    });

    // Build safe user object (exclude password)
    const { password: _pw, loginAttempts: _la, lockUntil: _lu, ...safeUser } = user;

    const token = signToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { token, user: safeUser }
    });
  } catch (error) {
    console.error('[auth.controller] login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res) => {
  try {
    // req.user is already populated by auth.middleware.js (protect)
    return res.status(200).json({
      success: true,
      message: 'Current user fetched successfully.',
      data: { user: req.user }
    });
  } catch (error) {
    console.error('[auth.controller] getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Change the authenticated user's password
 * @route   PUT /api/auth/change-password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((e) => e.msg).join(', ')
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch user with password field
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true }
    });

    // Verify old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
        error: 'Wrong password'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('[auth.controller] changePassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while changing password.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { register, login, getMe, changePassword };