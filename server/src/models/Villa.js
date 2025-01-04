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
    type: String,
    trim: true
  }
});

const roomSchema = new mongoose.Schema({
  name: {
    th: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  description: {
    th: {
      type: String,
      trim: true
    },
    en: {
      type: String,
      trim: true
    }
  },
  images: [{
    type: String
  }]
});

const villaSchema = new mongoose.Schema({
  name: {
    th: {
      type: String,
      required: [true, 'Thai name is required'],
      trim: true
    },
    en: {
      type: String,
      required: [true, 'English name is required'],
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
    th: {
      type: String,
      required: [true, 'Thai description is required'],
      trim: true
    },
    en: {
      type: String,
      required: [true, 'English description is required'],
      trim: true
    }
  },
  address: {
    en: {
      type: String,
      trim: true
    },
    th: {
      type: String,
      trim: true
    }
  },
  beachfront: {
    en: {
      type: String,
      trim: true
    },
    th: {
      type: String,
      trim: true
    }
  },
  pricing: {
    weekday: {
      regular: {
        type: Number,
        required: [true, 'Weekday regular price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0
      },
      discounted: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: 0,
        validate: {
          validator: function(value) {
            return !value || value <= this.pricing.weekday.regular;
          },
          message: 'Weekday discounted price must be less than regular price'
        }
      }
    },
    weekend: {
      regular: {
        type: Number,
        required: [true, 'Weekend regular price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0
      },
      discounted: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: 0,
        validate: {
          validator: function(value) {
            return !value || value <= this.pricing.weekend.regular;
          },
          message: 'Weekend discounted price must be less than regular price'
        }
      }
    }
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum number of guests is required'],
    min: [1, 'Must allow at least 1 guest']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 1
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 1
  },
  images: [{
    type: String
  }],
  rooms: [roomSchema],
  bankDetails: [bankDetailsSchema],
  promptPay: promptPaySchema,
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
        en: 'Villa Paradise',
        th: 'วิลล่า พาราไดซ์'
      },
      title: {
        en: 'Experience Luxury Like Never Before',
        th: 'สัมผัสประสบการณ์ความหรูหราที่ไม่เคยมีมาก่อน'
      },
      description: {
        en: 'A luxurious villa with modern amenities',
        th: 'วิลล่าหรูพร้อมสิ่งอำนวยความสะดวกทันสมัย'
      },
      beachfront: {
        en: 'Direct access to the beach',
        th: 'เข้าถึงชายหาดได้โดยตรง'
      },
      pricing: {
        weekday: {
          regular: 1000,
          discounted: 900
        },
        weekend: {
          regular: 1200,
          discounted: 1100
        }
      },
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 3,
      bankDetails: [],
      promptPay: { qrImage: '' }
    });
    await defaultVilla.save();
  }
};

const Villa = mongoose.model('Villa', villaSchema);

// Ensure a default villa exists
Villa.ensureDefaultVilla().catch(console.error);

export default Villa;
