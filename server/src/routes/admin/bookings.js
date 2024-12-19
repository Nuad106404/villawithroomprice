const express = require('express');
const router = express.Router();
const Booking = require('../../models/Booking');
const adminAuth = require('../../middleware/adminAuth');
const { body, query, validationResult } = require('express-validator');

// Validation middleware
const validateBookingUpdate = [
  body('status').isIn(['pending', 'approved', 'canceled']),
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('guests.adults').optional().isInt({ min: 1 }),
  body('guests.children').optional().isInt({ min: 0 }),
  body('amount').optional().isFloat({ min: 0 }),
];

// Get all bookings with filtering and pagination
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { bookingId: new RegExp(req.query.search, 'i') },
        { 'customer.firstName': new RegExp(req.query.search, 'i') },
        { 'customer.lastName': new RegExp(req.query.search, 'i') },
        { 'customer.email': new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.dateFrom || req.query.dateTo) {
      filter.checkIn = {};
      if (req.query.dateFrom) filter.checkIn.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) filter.checkIn.$lte = new Date(req.query.dateTo);
    }

    // Get bookings
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    // Get summary statistics
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = {
          count: curr.count,
          amount: curr.totalAmount
        };
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking
router.patch('/:id', adminAuth, validateBookingUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update only allowed fields
    const allowedUpdates = ['status', 'checkIn', 'checkOut', 'guests', 'amount', 'specialRequests'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(booking, updates);
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete booking
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    await booking.remove();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
