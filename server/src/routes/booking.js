import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Validation middleware
const validateBooking = [
  body('checkIn').isISO8601().toDate(),
  body('checkOut').isISO8601().toDate(),
  body('guests').isInt({ min: 1, max: 8 }),
  body('paymentMethod').isIn(['bank_transfer', 'promptpay']),
  body('specialRequests').optional().trim()
];

// Create a new booking
router.post('/', authenticate, validateBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { checkIn, checkOut, guests, paymentMethod, specialRequests } = req.body;

    // Check availability
    const isAvailable = await Booking.checkAvailability(checkIn, checkOut);
    if (!isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Selected dates are not available'
      });
    }

    // Calculate total price (example calculation)
    const pricePerNight = 1000; // THB
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = pricePerNight * nights;

    // Create booking
    const booking = new Booking({
      user: req.user.userId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      paymentMethod,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();

    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create booking'
    });
  }
});

// Get all bookings (admin only)
router.get('/admin', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

// Get user's bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: {
        bookings
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
});

// Update booking status (admin only)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    booking.status = status;
    if (status === 'cancelled') {
      await booking.cancel();
    }

    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const { paymentStatus } = req.body;
    if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment status'
    });
  }
});

// Cancel booking (user or admin)
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to cancel
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    await booking.cancel();
    await booking.save();

    res.json({
      status: 'success',
      data: {
        booking,
        refundAmount: booking.calculateRefundAmount()
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel booking'
    });
  }
});

export default router;
