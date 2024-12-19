const express = require('express');
const router = express.Router();
const Property = require('../../models/Property');
const adminAuth = require('../../middleware/adminAuth');
const multer = require('multer');
const sharp = require('sharp');
const { body, validationResult } = require('express-validator');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for image upload
const upload = multer({
  limits: {
    fileSize: 5000000, // 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file (jpg, jpeg, or png)'));
    }
    cb(undefined, true);
  },
});

// Validation middleware
const validateProperty = [
  body('name').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('location.address').notEmpty().trim(),
  body('location.city').notEmpty().trim(),
  body('location.state').notEmpty().trim(),
  body('location.country').notEmpty().trim(),
  body('location.zipCode').notEmpty().trim(),
  body('location.coordinates.lat').isFloat(),
  body('location.coordinates.lng').isFloat(),
  body('capacity.minGuests').isInt({ min: 1 }),
  body('capacity.maxGuests').isInt({ min: 1 }),
  body('capacity.maxChildren').isInt({ min: 0 }),
  body('size.squareFeet').isInt({ min: 1 }),
  body('size.rooms.bedrooms').isInt({ min: 1 }),
  body('size.rooms.bathrooms').isInt({ min: 1 }),
  body('pricing.baseRate').isFloat({ min: 0 }),
  body('pricing.cleaningFee').isFloat({ min: 0 }),
  body('pricing.securityDeposit').isFloat({ min: 0 }),
];

// Get property details
router.get('/', adminAuth, async (req, res) => {
  try {
    const property = await Property.findOne().populate('amenities');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update property details
router.patch('/', adminAuth, validateProperty, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let property = await Property.findOne();
    if (!property) {
      property = new Property(req.body);
    } else {
      Object.assign(property, req.body);
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload property images
router.post('/images', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const property = await Property.findOne();
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const uploadPromises = req.files.map(async (file) => {
      // Optimize image
      const buffer = await sharp(file.buffer)
        .resize(2000, 1500, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate unique filename
      const filename = `property/${Date.now()}-${file.originalname}`;

      // Upload to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: 'image/jpeg',
      }));

      // Add image to property
      property.images.push({
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`,
        alt: file.originalname,
        order: property.images.length,
      });
    });

    await Promise.all(uploadPromises);
    await property.save();

    res.json(property.images);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update image order
router.patch('/images/order', adminAuth, async (req, res) => {
  try {
    const property = await Property.findOne();
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const { imageOrder } = req.body;
    property.images = imageOrder.map((id, index) => {
      const image = property.images.id(id);
      image.order = index;
      return image;
    });

    await property.save();
    res.json(property.images);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete image
router.delete('/images/:imageId', adminAuth, async (req, res) => {
  try {
    const property = await Property.findOne();
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const image = property.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from S3
    const filename = image.url.split('/').pop();
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `property/${filename}`,
    }));

    // Remove from property
    image.remove();
    await property.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Set featured image
router.patch('/images/:imageId/featured', adminAuth, async (req, res) => {
  try {
    const property = await Property.findOne();
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Reset all featured flags
    property.images.forEach(img => {
      img.isFeatured = false;
    });

    // Set new featured image
    const image = property.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    image.isFeatured = true;

    await property.save();
    res.json(property.images);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
