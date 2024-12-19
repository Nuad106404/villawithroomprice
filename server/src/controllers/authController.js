import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { createLogger } from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

const logger = createLogger('auth-controller');

// Helper function to create and sign JWT
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to create and send token response
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id, user.role);
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      status: 'success',
      token,
      data: { user: user.toPublicJSON() }
    });
};

// Register new user
export const register = async (req, res, next) => {
  try {
    logger.info(`Registration attempt for email: ${req.body.email}`);
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      logger.warn('Registration failed: Missing required fields');
      throw new AppError('Please provide all required fields', 400);
    }

    // Check password strength
    if (password.length < 8) {
      logger.warn('Registration failed: Password too short');
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      logger.warn(`Registration failed: Email already exists - ${email}`);
      throw new AppError('Email already in use', 400);
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    try {
      const verificationURL = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Please verify your email',
        template: 'verificationEmail',
        data: {
          firstName: user.firstName,
          verificationURL
        }
      });
      logger.info(`Verification email sent to: ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send verification email: ${error.message}`);
      // Don't throw error here, just log it
    }

    logger.info(`New user registered successfully: ${user.email}`);
    createSendToken(user, 201, req, res);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    logger.info(`Login attempt for email: ${req.body.email}`);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      logger.warn('Login failed: Missing email or password');
      throw new AppError('Please provide email and password', 400);
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      logger.warn(`Login failed: No user found with email - ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password);
    if (!isPasswordCorrect) {
      logger.warn(`Login failed: Incorrect password for email - ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    // Optional: Check if email is verified
    // if (!user.isVerified) {
    //   logger.warn(`Login failed: Email not verified - ${email}`);
    //   throw new AppError('Please verify your email first', 401);
    // }

    logger.info(`User logged in successfully: ${user.email}`);
    createSendToken(user, 200, req, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// Logout user
export const logout = (req, res) => {
  try {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      sameSite: 'lax'
    });
    logger.info('User logged out successfully');
    res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn(`Verification failed: Invalid or expired token - ${token}`);
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);
    createSendToken(user, 200, req, res);
  } catch (error) {
    logger.error(`Verification error: ${error.message}`);
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.warn(`Forgot password failed: No user found with email - ${email}`);
      throw new AppError('There is no user with this email address', 404);
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 1 hour)',
        template: 'resetPassword',
        data: {
          firstName: user.firstName,
          resetURL
        }
      });
      logger.info(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email: ${error.message}`);
      // Don't throw error here, just log it
    }

    logger.info(`Password reset token sent to user: ${user.email}`);
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn(`Reset password failed: Invalid or expired token - ${token}`);
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);
    createSendToken(user, 200, req, res);
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};

// Update password
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(currentPassword))) {
      logger.warn(`Update password failed: Incorrect current password`);
      throw new AppError('Your current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);
    createSendToken(user, 200, req, res);
  } catch (error) {
    logger.error(`Update password error: ${error.message}`);
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: { user: user.toPublicJSON() }
    });
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    next(error);
  }
};
