import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Register route
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error',
        message: 'User already exists'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });

    await user.save();

    // Generate verification URL
    const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail({
      email: user.email,
      template: 'verificationEmail',
      data: {
        firstName: user.firstName,
        verificationURL
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error creating user'
    });
  }
});

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email before logging in',
        isVerified: false
      });
    }

    // Check password
    const isMatch = await user.correctPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      token,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error during login'
    });
  }
});

// Verify email route
router.get('/verify/:token', async (req, res) => {
  try {
    console.log('Verifying token:', req.params.token);
    
    // Find user by verification token
    const user = await User.findOne({
      verificationToken: req.params.token
    });

    if (!user) {
      console.log('No user found with token');
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification token'
      });
    }

    console.log('User found:', user.email);

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('User verified successfully');

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      message: 'Email verified successfully',
      token,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying email'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with this email'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Generate verification URL
    const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await sendEmail({
      email: user.email,
      template: 'verificationEmail',
      data: {
        firstName: user.firstName,
        verificationURL
      }
    });

    res.json({
      status: 'success',
      message: 'Verification email has been sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending verification email'
    });
  }
});

// Get current user route
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found'
      });
    }
    res.json({
      status: 'success',
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Error fetching user data'
    });
  }
});

export default router;
