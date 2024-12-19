import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  uploadPaymentSlip
} from '../controllers/bookingController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .post(createBooking)
  .get(getUserBookings);

router
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking);

router.post('/:id/cancel', cancelBooking);
router.post('/:id/upload-slip', upload.single('slip'), uploadPaymentSlip);

export default router;
