import express from 'express';
import Booking from '../../models/Booking.js';
import villaRoutes from './villa.js';

const router = express.Router();

// Mount villa routes
router.use('/villa', villaRoutes);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalBookings, pendingPayments, confirmedBookings] = await Promise.all([
      // Total bookings (excluding cancelled and expired)
      Booking.countDocuments({
        status: { $nin: ['cancelled', 'expired'] }
      }),
      // Pending payments count
      Booking.countDocuments({
        status: { $in: ['pending', 'pending_payment'] }
      }),
      // Confirmed bookings for revenue calculation
      Booking.find({ status: 'confirmed' })
    ]);

    // Calculate total revenue from confirmed bookings
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.bookingDetails?.totalPrice || 0), 0);

    res.json({
      totalBookings,
      pendingPayments,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// Get recent bookings
router.get('/recent-bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Format the bookings for the frontend
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      customerName: `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
      status: booking.status,
      createdAt: booking.createdAt,
      totalPrice: booking.bookingDetails.totalPrice,
      guests: booking.bookingDetails.guests,
      checkIn: booking.bookingDetails.checkIn,
      checkOut: booking.bookingDetails.checkOut
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ message: 'Failed to fetch recent bookings' });
  }
});

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });

    // Format the bookings for the frontend
    const formattedBookings = bookings.map(booking => ({
      _id: booking._id,
      customerName: `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
      checkIn: booking.bookingDetails.checkIn,
      checkOut: booking.bookingDetails.checkOut,
      totalPrice: booking.bookingDetails.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      guests: booking.bookingDetails.guests
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Format the response
    const formattedBooking = {
      _id: booking._id,
      customerName: `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
      checkIn: booking.bookingDetails.checkIn,
      checkOut: booking.bookingDetails.checkOut,
      totalPrice: booking.bookingDetails.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      guests: booking.bookingDetails.guests
    };

    res.json(formattedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Update booking details
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, checkIn, checkOut, guests, totalPrice } = req.body;

    // Split customer name into first and last name
    const [firstName, ...lastNameParts] = customerName.split(' ');
    const lastName = lastNameParts.join(' ');

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        'customerInfo.firstName': firstName,
        'customerInfo.lastName': lastName || '',
        'bookingDetails.checkIn': checkIn,
        'bookingDetails.checkOut': checkOut,
        'bookingDetails.guests': guests,
        'bookingDetails.totalPrice': totalPrice
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Format the response
    const formattedBooking = {
      _id: booking._id,
      customerName: `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
      checkIn: booking.bookingDetails.checkIn,
      checkOut: booking.bookingDetails.checkOut,
      totalPrice: booking.bookingDetails.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      guests: booking.bookingDetails.guests
    };

    res.json(formattedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Delete booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

export default router;