import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../../models/Booking.js';
import Villa from '../../models/Villa.js';
import { calculateTotalPrice, getAvailableDates } from '../../services/bookingService.js';

const router = express.Router();

// Validation middleware for initial booking
const validateInitialBooking = [
  body('bookingDetails.checkIn').isISO8601(),
  body('bookingDetails.checkOut').isISO8601(),
  body('bookingDetails.guests').isInt({ min: 1 }),
  body('bookingDetails.totalPrice').isFloat({ min: 0 }),
];

// Validation middleware for customer info
const validateCustomerInfo = [
  body('customerInfo.firstName').trim().notEmpty(),
  body('customerInfo.lastName').trim().notEmpty(),
  body('customerInfo.email').isEmail(),
  body('customerInfo.phone').trim().notEmpty(),
];

// Get available dates and prices
router.get('/available-dates', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }

    const dates = await getAvailableDates(startDate, endDate);
    
    res.json({
      status: 'success',
      data: dates
    });
  } catch (error) {
    console.error('Error getting available dates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get available dates'
    });
  }
});

// Create a new booking
router.post('/', validateInitialBooking, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Calculate total price based on weekday/weekend rates
    const totalPrice = await calculateTotalPrice(req.body.bookingDetails.checkIn, req.body.bookingDetails.checkOut);

    const booking = new Booking({
      bookingDetails: {
        ...req.body.bookingDetails,
        totalPrice
      },
      status: 'pending'
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update booking with customer info
router.patch('/:id/customer-info', validateCustomerInfo, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update booking payment
router.patch('/:id/payment', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update only allowed fields
    if (req.body.status) {
      booking.status = req.body.status;
    }

    if (req.body.paymentDetails) {
      booking.paymentMethod = req.body.paymentDetails.method;
      booking.paymentSlipUrl = req.body.paymentDetails.slipUrl;
      booking.paymentStatus = req.body.paymentDetails.status;
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
