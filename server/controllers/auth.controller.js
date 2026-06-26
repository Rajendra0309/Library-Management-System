const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { generateMembershipId } = require('../utils/membershipId');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/** Generate a random 6-digit numeric OTP */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

    const { name, email, password, phone, securityQuestion, securityAnswer, city } = req.body;

    // Security question is required
    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Security question and answer are required.',
        error: 'Missing security question'
      });
    }

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

    // Hash security answer (case-insensitive — normalise to lowercase before hashing)
    const hashedAnswer = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'member',
        status: 'active',
        membershipId,
        securityQuestion: securityQuestion.trim(),
        securityAnswer: hashedAnswer,
        city: city ? city.trim() : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        membershipId: true,
        city: true,
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
        city: true,
        status: true,
        password: true,
        loginAttempts: true,
        lockUntil: true,
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

    // Verify against current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password.' });
    }

    // Verify against password history
    const history = await prisma.passwordHistory.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    for (const record of history) {
      const match = await bcrypt.compare(newPassword, record.hash);
      if (match) {
        return res.status(400).json({ success: false, message: 'New password cannot be the same as any of your last 3 passwords.' });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.passwordHistory.create({
        data: { userId: req.user.id, hash: hashedPassword }
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword, passwordChangedAt: new Date() }
      })
    ]);

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

/**
 * @desc    Return the security question for a given email (no answer)
 * @route   POST /api/auth/forgot-password/question
 * @access  Public
 */
const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { securityQuestion: true }
    });

    // Generic response to prevent email enumeration
    if (!user || !user.securityQuestion) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email, or no security question set.'
      });
    }

    return res.status(200).json({
      success: true,
      data: { securityQuestion: user.securityQuestion }
    });
  } catch (error) {
    console.error('[auth.controller] getSecurityQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Verify security answer. On failure, generate + return a one-time OTP.
 * @route   POST /api/auth/forgot-password/verify-answer
 * @access  Public
 */
const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    if (!email || !securityAnswer) {
      return res.status(400).json({ success: false, message: 'Email and answer are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, securityAnswer: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    // Compare answer (normalise to lowercase before comparing)
    const isMatch = await bcrypt.compare(
      securityAnswer.trim().toLowerCase(),
      user.securityAnswer
    );

    if (isMatch) {
      // Answer correct — issue a short-lived reset token so the client can call resetPassword
      const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
      return res.status(200).json({
        success: true,
        message: 'Security answer verified.',
        data: { resetToken }
      });
    }

    // Answer wrong — generate OTP and return it to the client for display
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otpHash,
        resetOtpExpiry: new Date(Date.now() + OTP_EXPIRY_MS)
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Security answer incorrect. An OTP has been generated for fallback verification.',
      data: { otp }   // shown on-screen via popup
    });
  } catch (error) {
    console.error('[auth.controller] verifySecurityAnswer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Verify the on-screen OTP. Returns a reset token on success.
 * @route   POST /api/auth/forgot-password/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, resetOtp: true, resetOtpExpiry: true }
    });

    if (!user || !user.resetOtp) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please restart the process.' });
    }

    // Check expiry
    if (user.resetOtpExpiry < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetOtp: null, resetOtpExpiry: null }
      });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please try again.' });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp.trim(), user.resetOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP valid — clear it and issue reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: null, resetOtpExpiry: null }
    });

    const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({
      success: true,
      message: 'OTP verified.',
      data: { resetToken }
    });
  } catch (error) {
    console.error('[auth.controller] verifyOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Reset password using a valid reset token
 * @route   POST /api/auth/forgot-password/reset
 * @access  Public (but needs resetToken)
 */
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    // Get user to check current password
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify against current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password.' });
    }

    // Verify against password history
    const history = await prisma.passwordHistory.findMany({
      where: { userId: decoded.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    for (const record of history) {
      const match = await bcrypt.compare(newPassword, record.hash);
      if (match) {
        return res.status(400).json({ success: false, message: 'New password cannot be the same as any of your last 3 passwords.' });
      }
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.passwordHistory.create({
        data: { userId: decoded.id, hash: hashedPassword }
      }),
      prisma.user.update({
        where: { id: decoded.id },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
          loginAttempts: 0,       // clear any lockout
          lockUntil: null
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('[auth.controller] resetPassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, changePassword, getSecurityQuestion, verifySecurityAnswer, verifyOtp, resetPassword };
