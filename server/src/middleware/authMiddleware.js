import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-middleware');

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Get token from authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // 4) Check if user changed password after the token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AppError('User recently changed password! Please log in again.', 401);
    }

    // 5) Check if user is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your email to access this resource.', 401);
    }

    // 6) Check if user has required role (if specified in token)
    if (decoded.role && decoded.role !== user.role) {
      throw new AppError('User role has been changed. Please log in again.', 401);
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(error);
  }
};

// Middleware for restricting access to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

// Middleware to check if user is logged in (for rendering pages)
export const isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      req.user = user;
      return next();
    }
    next();
  } catch (error) {
    next();
  }
};
