import mongoose from 'mongoose';

const bankDetailsSchema = new mongoose.Schema({
  bank: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  }
});

const promptPaySchema = new mongoose.Schema({
  qrImage: {
    type: String
  }
});

const villaSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: [true, 'English villa name is required'],
      trim: true
    },
    th: {
      type: String,
      required: [true, 'Thai villa name is required'],
      trim: true
    }
  },
  title: {
    en: {
      type: String,
      required: [true, 'English title is required'],
      trim: true
    },
    th: {
      type: String,
      required: [true, 'Thai title is required'],
      trim: true
    }
  },
  description: {
    en: {
      type: String,
      required: [true, 'English description is required'],
      trim: true
    },
    th: {
      type: String,
      required: [true, 'Thai description is required'],
      trim: true
    }
  },
  beachfront: {
    en: {
      type: String,
      default: 'Direct access to the beach',
      trim: true
    },
    th: {
      type: String,
      default: 'เข้าถึงชายหาดได้โดยตรง',
      trim: true
    }
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    default: 0,
    validate: {
      validator: function(value) {
        return value === 0 || value < this.pricePerNight;
      },
      message: 'Discounted price must be less than regular price'
    }
  },
  maxGuests: {
    type: Number,
    required: true,
    default: 6
  },
  bedrooms: {
    type: Number,
    required: true,
    default: 3
  },
  bathrooms: {
    type: Number,
    required: true,
    default: 3
  },
  bankDetails: [bankDetailsSchema],
  promptPay: promptPaySchema,
  backgroundImage: {
    type: String
  },
  slideImages: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a default villa if none exists
villaSchema.statics.ensureDefaultVilla = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultVilla = new this({
      name: {
        en: 'Luxury Beach Villa',
        th: 'วิลล่าหรูริมทะเล'
      },
      title: {
        en: 'Beachfront Paradise',
        th: 'สวรรค์ริมทะเล'
      },
      description: {
        en: 'Experience luxury living by the beach',
        th: 'สัมผัสประสบการณ์การพักผ่อนสุดหรูริมทะเล'
      },
      bankDetails: [
        {
          bank: 'Kasikorn Bank (KBank)',
          accountNumber: 'xxx-x-xxxxx-x',
          accountName: 'Your Company Name Co., Ltd.'
        }
      ],
      promptPay: {
        qrImage: ''
      }
    });
    await defaultVilla.save();
  }
};

const Villa = mongoose.model('Villa', villaSchema);

// Ensure a default villa exists
Villa.ensureDefaultVilla().catch(console.error);

export default Villa;
