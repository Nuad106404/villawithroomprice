import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

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

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'admin'  // Set default role to admin
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
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
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Invalid or expired verification link`);
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to admin dashboard with token
    res.redirect(`${process.env.CLIENT_URL}/auth/verify-success?token=${token}`);
  } catch (error) {
    console.error('Verification error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=Verification failed`);
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
