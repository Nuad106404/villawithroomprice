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
      values: ['pending', 'pending_payment', 'in_review', 'confirmed', 'cancelled', 'expired'],
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
  canExpire: {
    type: Boolean,
    default: true,
    index: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    },
    index: true
  },
  paymentDeadline: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    },
    index: true
  }
}, {
  timestamps: true
});

// Create compound TTL index
bookingSchema.index(
  { expiresAt: 1 },
  { 
    expireAfterSeconds: 0,
    partialFilterExpression: {
      canExpire: true,
      expiresAt: { $exists: true, $ne: null }
    }
  }
);

// Create TTL index for payment deadline
bookingSchema.index(
  { paymentDeadline: 1 },
  { 
    expireAfterSeconds: 0,
    partialFilterExpression: {
      status: 'pending_payment',
      paymentSlipUrl: { $exists: false }
    }
  }
);

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  try {
    // If payment slip is uploaded, prevent expiration and change status
    if (this.isModified('paymentSlipUrl') && this.paymentSlipUrl) {
      this.status = 'in_review';
      this.canExpire = false;
      this.expiresAt = null;
      this.paymentDeadline = null; // Remove deadline since payment is uploaded
    }

    // If status changes to anything other than pending, prevent expiration
    if (this.isModified('status') && this.status !== 'pending') {
      this.canExpire = false;
      this.expiresAt = null;
    }

    // If status is changing to pending_payment, set deadline
    if (this.isModified('status') && this.status === 'pending_payment' && !this.paymentSlipUrl) {
      this.paymentDeadline = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes deadline
    }

    // If status changes to anything other than pending_payment, remove deadline
    if (this.isModified('status') && this.status !== 'pending_payment') {
      this.paymentDeadline = null;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-find middleware
bookingSchema.pre(/^find/, function(next) {
  const now = new Date();
  
  this.where({
    $or: [
      // Keep documents that can't expire
      { canExpire: false },
      // Keep documents that haven't expired yet
      { expiresAt: { $gt: now } },
      // Keep documents with payment slip
      { paymentSlipUrl: { $exists: true } },
      // Keep all documents with payment slip
      { paymentSlipUrl: { $exists: true } },
      // Keep documents not in pending_payment status
      { status: { $ne: 'pending_payment' } },
      // Keep pending_payment documents within deadline
      { 
        $and: [
          { status: 'pending_payment' },
          { paymentDeadline: { $gt: now } }
        ]
      }
    ]
  });
  
  next();
});

// Instance method to check if booking is expired
bookingSchema.methods.isExpired = function() {
  if (!this.canExpire || this.paymentSlipUrl) {
    return false;
  }
  
  return this.expiresAt && this.expiresAt < new Date();
};

// Instance method to check if payment deadline is expired
bookingSchema.methods.isPaymentExpired = function() {
  // Never expire if payment slip exists
  if (this.paymentSlipUrl) {
    return false;
  }
  
  // Only check deadline for pending_payment status
  if (this.status !== 'pending_payment') {
    return false;
  }
  
  return this.paymentDeadline && this.paymentDeadline < new Date();
};

// Static method to manually clean up expired bookings if needed
bookingSchema.statics.cleanupExpired = async function() {
  const now = new Date();
  return this.deleteMany({
    canExpire: true,
    expiresAt: { $lt: now },
    paymentSlipUrl: { $exists: false }
  });
};

// Static method to clean up expired payment deadlines
bookingSchema.statics.cleanupExpiredPayments = async function() {
  const now = new Date();
  return this.deleteMany({
    status: 'pending_payment',
    paymentSlipUrl: { $exists: false },
    paymentDeadline: { $lt: now }
  });
};

const Booking = mongoose.model('Booking', bookingSchema);

// Ensure indexes are created
Promise.all([
  // Create TTL index
  Booking.collection.createIndex(
    { expiresAt: 1 },
    { 
      expireAfterSeconds: 0,
      partialFilterExpression: {
        canExpire: true,
        expiresAt: { $exists: true, $ne: null }
      }
    }
  ),
  // Create TTL index for payment deadline
  Booking.collection.createIndex(
    { paymentDeadline: 1 },
    { 
      expireAfterSeconds: 0,
      partialFilterExpression: {
        status: 'pending_payment',
        paymentSlipUrl: { $exists: false }
      }
    }
  ),
  // Create compound index for queries
  Booking.collection.createIndex(
    { canExpire: 1, expiresAt: 1, paymentSlipUrl: 1, status: 1, paymentDeadline: 1 },
    { background: true }
  )
]).then(() => {
  console.log('All booking indexes created successfully');
}).catch(err => {
  console.error('Error creating booking indexes:', err);
});

// Set up periodic cleanup
setInterval(async () => {
  try {
    await Booking.cleanupExpired();
    await Booking.cleanupExpiredPayments();
  } catch (error) {
    console.error('Error cleaning up expired bookings and payments:', error);
  }
}, 30 * 1000); // Run every 30 seconds

export default Booking;
