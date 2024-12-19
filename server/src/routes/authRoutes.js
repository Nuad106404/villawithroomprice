import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  getCurrentUser
} from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', rateLimiter, register);
router.post('/login', rateLimiter, login);
router.get('/logout', logout);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', rateLimiter, forgotPassword);
router.patch('/reset-password/:token', rateLimiter, resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware require authentication
router.get('/me', getCurrentUser);
router.patch('/update-password', updatePassword);

export default router;
