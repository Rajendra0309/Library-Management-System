const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { generateMembershipId } = require('../utils/membershipId');
const mailer = require('../utils/mailer');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/** Generate a random 6-digit numeric OTP */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/** Generate a signed JWT token for a user ID */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// In-memory store for registration OTPs (Email -> { otp, expiresAt })
const registrationOtps = new Map();

/**
 * @desc    Send OTP to verify email during registration
 * @route   POST /api/auth/send-verification-otp
 * @access  Public
 */
const sendRegistrationOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    email = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const otp = generateOtp();
    registrationOtps.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    await mailer.sendOtpEmail(email, 'Future Member', otp);

    return res.status(200).json({ success: true, message: 'Verification OTP sent to your email.' });
  } catch (error) {
    console.error('[auth.controller] sendRegistrationOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
  }
};

/**
 * @desc    Verify the registration OTP
 * @route   POST /api/auth/verify-registration-otp
 * @access  Public
 */
const verifyRegistrationOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    email = email.toLowerCase().trim();

    const record = registrationOtps.get(email);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email.' });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(email);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    console.error('[auth.controller] verifyRegistrationOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error while verifying OTP.' });
  }
};

/**
 * @desc    Register a new member
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', error: errors.array().map((e) => e.msg).join(', ') });
    }

    const { name, email, password, phone, securityQuestion, securityAnswer, city, otp } = req.body;

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ success: false, message: 'Security question and answer are required.' });
    }

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Email verification OTP is required.' });
    }

    const record = registrationOtps.get(email);
    if (!record || record.otp !== otp.trim() || Date.now() > record.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please verify your email again.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const membershipId = await generateMembershipId();
    const hashedAnswer = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 12);

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

    registrationOtps.delete(email);

    // Send Welcome Email asynchronously
    mailer.sendWelcomeEmail(user.email, user.name).catch(console.error);

    const token = signToken(user.id);
    return res.status(201).json({ success: true, message: 'Registration successful. Welcome to LibraVault!', data: { token, user } });
  } catch (error) {
    console.error('[auth.controller] register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * @desc    Login user and return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', error: errors.array().map((e) => e.msg).join(', ') });
    }

    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, phone: true, role: true, membershipId: true, city: true, status: true, password: true, loginAttempts: true, lockUntil: true, createdAt: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(403).json({ success: false, message: `Account is locked. Please try again in ${minutesLeft} minute(s).` });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const isNowLocked = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, ...(isNowLocked && { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) }) }
      });

      if (isNowLocked) {
        return res.status(403).json({ success: false, message: 'Account locked for 15 minutes due to 3 failed login attempts.' });
      }

      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      return res.status(401).json({ success: false, message: `Invalid email or password. ${attemptsRemaining} attempt(s) remaining.` });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null }
    });

    const { password: _pw, loginAttempts: _la, lockUntil: _lu, ...safeUser } = user;
    const token = signToken(user.id);

    return res.status(200).json({ success: true, message: 'Login successful.', data: { token, user: safeUser } });
  } catch (error) {
    console.error('[auth.controller] login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * @desc    Get the currently authenticated user
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Current user fetched successfully.', data: { user: req.user } });
  } catch (error) {
    console.error('[auth.controller] getMe error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Change the authenticated user's password
 * @route   PUT /api/auth/change-password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', error: errors.array().map((e) => e.msg).join(', ') });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, password: true, email: true, name: true } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password.' });

    const history = await prisma.passwordHistory.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 3 });
    for (const record of history) {
      const match = await bcrypt.compare(newPassword, record.hash);
      if (match) return res.status(400).json({ success: false, message: 'New password cannot be the same as any of your last 3 passwords.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.passwordHistory.create({ data: { userId: req.user.id, hash: hashedPassword } }),
      prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword, passwordChangedAt: new Date() } })
    ]);

    mailer.sendPasswordChangedEmail(user.email, user.name).catch(console.error);

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('[auth.controller] changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};

/**
 * @desc    Send OTP to email for password reset
 * @route   POST /api/auth/forgot-password/send-otp
 * @access  Public
 */
const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
    if (!user) {
      // Generic response to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp: otpHash, resetOtpExpiry: new Date(Date.now() + OTP_EXPIRY_MS) }
    });

    await mailer.sendOtpEmail(email, user.name, otp);

    return res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent.' });
  } catch (error) {
    console.error('[auth.controller] forgotPasswordSendOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Verify the emailed OTP. Returns a reset token on success.
 * @route   POST /api/auth/forgot-password/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, resetOtp: true, resetOtpExpiry: true } });
    if (!user || !user.resetOtp) return res.status(400).json({ success: false, message: 'No OTP found. Please restart the process.' });

    if (user.resetOtpExpiry < new Date()) {
      await prisma.user.update({ where: { id: user.id }, data: { resetOtp: null, resetOtpExpiry: null } });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please try again.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.resetOtp);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });

    await prisma.user.update({ where: { id: user.id }, data: { resetOtp: null, resetOtpExpiry: null } });

    const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.status(200).json({ success: true, message: 'OTP verified.', data: { resetToken } });
  } catch (error) {
    console.error('[auth.controller] verifyOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
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
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await prisma.user.findUnique({ where: { email }, select: { securityQuestion: true } });
    if (!user || !user.securityQuestion) {
      return res.status(404).json({ success: false, message: 'No account found with that email, or no security question set.' });
    }

    return res.status(200).json({ success: true, data: { securityQuestion: user.securityQuestion } });
  } catch (error) {
    console.error('[auth.controller] getSecurityQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Verify security answer. Returns reset token on success.
 * @route   POST /api/auth/forgot-password/verify-answer
 * @access  Public
 */
const verifySecurityAnswer = async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    if (!email || !securityAnswer) return res.status(400).json({ success: false, message: 'Email and answer are required.' });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, securityAnswer: true } });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const isMatch = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswer);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Security answer is incorrect.' });
    }

    const resetToken = jwt.sign({ id: user.id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.status(200).json({ success: true, message: 'Security answer verified.', data: { resetToken } });
  } catch (error) {
    console.error('[auth.controller] verifySecurityAnswer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Reset password using a valid reset token
 * @route   POST /api/auth/forgot-password/reset
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    if (decoded.purpose !== 'reset') return res.status(400).json({ success: false, message: 'Invalid reset token.' });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) return res.status(400).json({ success: false, message: 'New password cannot be the same as the current password.' });

    const history = await prisma.passwordHistory.findMany({ where: { userId: decoded.id }, orderBy: { createdAt: 'desc' }, take: 3 });
    for (const record of history) {
      const match = await bcrypt.compare(newPassword, record.hash);
      if (match) return res.status(400).json({ success: false, message: 'New password cannot be the same as any of your last 3 passwords.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.passwordHistory.create({ data: { userId: decoded.id, hash: hashedPassword } }),
      prisma.user.update({
        where: { id: decoded.id },
        data: { password: hashedPassword, passwordChangedAt: new Date(), loginAttempts: 0, lockUntil: null }
      })
    ]);

    mailer.sendPasswordChangedEmail(user.email, user.name).catch(console.error);

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[auth.controller] resetPassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  register,
  login,
  getMe,
  changePassword,
  forgotPasswordSendOtp,
  verifyOtp,
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword
};
