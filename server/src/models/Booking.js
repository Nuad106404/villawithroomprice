import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customerInfo: {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
    }
  },
  bookingDetails: {
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required']
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'],
      max: [8, 'Number of guests cannot exceed 8']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'pending_payment', 'confirmed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['bank_transfer', 'promptpay'],
      message: '{VALUE} is not a valid payment method'
    }
  },
  paymentSlipUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to validate dates
bookingSchema.pre('save', function(next) {
  if (this.bookingDetails.checkOut <= this.bookingDetails.checkIn) {
    next(new Error('Check-out date must be after check-in date'));
  }
  this.updatedAt = new Date();
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
