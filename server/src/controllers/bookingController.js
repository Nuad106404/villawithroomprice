import Booking from '../models/Booking.js';
import { AppError } from '../middleware/errorHandler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('booking-controller');

// Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      checkIn,
      checkOut,
      guests,
      totalPrice,
      paymentMethod,
      specialRequests
    } = req.body;

    // Set initial status to pending
    const bookingData = {
      user: req.user._id,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      paymentMethod,
      specialRequests,
      status: 'pending'
    };

    // Check availability
    const isAvailable = await Booking.checkAvailability(checkIn, checkOut);
    if (!isAvailable) {
      throw new AppError('Selected dates are not available', 400);
    }

    const booking = await Booking.create(bookingData);

    logger.info(`New booking created with ID: ${booking._id}`);

    res.status(201).json({
      status: 'success',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings for a user
export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single booking
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if booking is expired
    if (booking.isExpired()) {
      return next(new AppError('Booking has expired', 410)); // 410 Gone
    }

    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Update a booking
export const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if booking is expired
    if (booking.isExpired()) {
      return next(new AppError('Booking has expired', 410)); // 410 Gone
    }

    // Update booking
    Object.assign(booking, req.body);
    const updatedBooking = await booking.save();

    res.status(200).json({
      status: 'success',
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a booking
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new AppError('No booking found with that ID', 404);
    }

    // Check if the booking belongs to the user
    if (booking.user.toString() !== req.user._id.toString()) {
      throw new AppError('You do not have permission to cancel this booking', 403);
    }

    await booking.cancel();

    logger.info(`Booking ${booking._id} cancelled`);

    res.status(200).json({
      status: 'success',
      data: { 
        booking,
        refundAmount: booking.calculateRefundAmount()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Upload payment slip
export const uploadPaymentSlip = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if booking is expired
    if (booking.isExpired()) {
      return next(new AppError('Booking has expired', 410)); // 410 Gone
    }

    // Check if booking is in correct status
    if (booking.status !== 'pending_payment') {
      return next(new AppError('Booking is not in pending payment status', 400));
    }

    // Update payment slip URL (status will be changed to in_review in pre-save middleware)
    booking.paymentSlipUrl = req.body.paymentSlipUrl;
    const updatedBooking = await booking.save();

    logger.info(`Payment slip uploaded for booking ${booking._id}`);

    res.status(200).json({
      status: 'success',
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};
