import express from 'express';
import Villa from '../../models/Villa.js';
import { upload } from '../../../config/multer.mjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Create uploads directory for villa backgrounds if it doesn't exist
const villaUploadsDir = path.join(__dirname, '../../../public/uploads/villa');
if (!fs.existsSync(villaUploadsDir)) {
  fs.mkdirSync(villaUploadsDir, { recursive: true });
}

// Create uploads directory for QR codes if it doesn't exist
const qrUploadsDir = path.join(__dirname, '../../../uploads/QR');
if (!fs.existsSync(qrUploadsDir)) {
  fs.mkdirSync(qrUploadsDir, { recursive: true });
}

// Configure multer for QR code upload
const qrStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, qrUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = uuidv4();
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const qrUpload = multer({
  storage: qrStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get villa details
router.get('/', async (req, res) => {
  try {
    let villa = await Villa.findOne();
    if (!villa) {
      villa = await Villa.create({
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
        pricePerNight: 299,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3
      });
    }
    res.json(villa);
  } catch (error) {
    console.error('Error getting villa details:', error);
    res.status(500).json({ message: 'Error getting villa details' });
  }
});

// Update bank details
router.patch('/bank-details', async (req, res) => {
  try {
    const { bankDetails } = req.body;

    // Validate bank details
    if (!Array.isArray(bankDetails)) {
      return res.status(400).json({
        message: 'Bank details must be an array'
      });
    }

    // Validate each bank detail
    for (const bank of bankDetails) {
      if (!bank.bank || !bank.accountNumber || !bank.accountName) {
        return res.status(400).json({
          message: 'Each bank detail must include bank name, account number, and account name'
        });
      }
    }

    // Find the villa
    let villa = await Villa.findOne();
    if (!villa) {
      villa = new Villa();
    }

    // Format and update bank details
    const formattedBankDetails = bankDetails.map(bank => ({
      bank: bank.bank.trim(),
      accountNumber: bank.accountNumber.trim().replace(/\s+/g, '-'),
      accountName: bank.accountName.trim()
    }));

    villa.bankDetails = formattedBankDetails;
    await villa.save();

    res.json({
      message: 'Bank details updated successfully',
      bankDetails: villa.bankDetails
    });
  } catch (error) {
    console.error('Error updating bank details:', error);
    res.status(500).json({ 
      message: 'Error updating bank details',
      error: error.message 
    });
  }
});

// Update villa details
router.patch('/', async (req, res) => {
  try {
    const { 
      name, 
      title, 
      description, 
      beachfront, 
      maxGuests, 
      bedrooms, 
      bathrooms, 
      pricePerNight, 
      discountedPrice,
      bankDetails,
      promptPay
    } = req.body;

    // Find the villa
    let villa = await Villa.findOne();
    if (!villa) {
      villa = new Villa();
    }

    // Update fields if provided
    if (name?.en && name?.th && title?.en && title?.th && description?.en && description?.th) {
      villa.name = name;
      villa.title = title;
      villa.description = description;
    }

    // Update optional beachfront if provided
    if (beachfront) {
      villa.beachfront = {
        en: beachfront.en || villa.beachfront.en,
        th: beachfront.th || villa.beachfront.th
      };
    }

    // Update pricePerNight if provided
    if (pricePerNight !== undefined) {
      villa.pricePerNight = pricePerNight;
    }

    // Update discountedPrice if provided
    if (discountedPrice !== undefined) {
      // Validate that discounted price is less than regular price
      if (discountedPrice > 0 && discountedPrice >= pricePerNight) {
        return res.status(400).json({
          message: 'Discounted price must be less than regular price'
        });
      }
      villa.discountedPrice = discountedPrice;
    }

    // Update maxGuests if provided
    if (maxGuests !== undefined) {
      villa.maxGuests = maxGuests;
    }

    // Update bedrooms if provided
    if (bedrooms !== undefined) {
      villa.bedrooms = bedrooms;
    }

    // Update bathrooms if provided
    if (bathrooms !== undefined) {
      villa.bathrooms = bathrooms;
    }

    // Update bankDetails if provided
    if (bankDetails !== undefined) {
      villa.bankDetails = bankDetails;
    }

    // Update promptPay if provided
    if (promptPay !== undefined) {
      villa.promptPay = promptPay;
    }

    await villa.save();
    res.json(villa);
  } catch (error) {
    console.error('Error updating villa details:', error);
    res.status(500).json({ 
      message: 'Error updating villa details',
      error: error.message 
    });
  }
});

router.patch('/background', upload.single('backgroundImage'), async (req, res) => {
  try {
    console.log('Received file upload request');
    console.log('File:', req.file);

    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const villa = await Villa.findOne();
    if (!villa) {
      console.log('Villa not found');
      return res.status(404).json({ message: 'Villa not found' });
    }

    // Delete old background image if it exists
    if (villa.backgroundImage) {
      const oldImagePath = path.join(__dirname, '../../../uploads', villa.backgroundImage);
      console.log('Checking old image at:', oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        console.log('Deleting old image');
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update the villa with the new background image path
    const imageUrl = `/uploads/villa/${req.file.filename}`;
    console.log('Setting new image URL:', imageUrl);
    villa.backgroundImage = imageUrl;
    await villa.save();

    console.log('Villa updated successfully');
    res.json({ message: 'Background image updated successfully', villa });
  } catch (error) {
    console.error('Error updating background image:', error);
    res.status(500).json({ message: 'Error updating background image', error: error.message });
  }
});

router.post('/background', upload.single('backgroundImage'), async (req, res) => {
  try {
    console.log('Received file upload request');
    console.log('File:', req.file);

    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const villa = await Villa.findOne();
    if (!villa) {
      console.log('Villa not found');
      return res.status(404).json({ message: 'Villa not found' });
    }

    // Delete old background image if it exists
    if (villa.backgroundImage) {
      const oldImagePath = path.join(__dirname, '../../../uploads', villa.backgroundImage);
      console.log('Checking old image at:', oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        console.log('Deleting old image');
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update the villa with the new background image path
    const imageUrl = `/uploads/villa/${req.file.filename}`;
    console.log('Setting new image URL:', imageUrl);
    villa.backgroundImage = imageUrl;
    await villa.save();

    console.log('Villa updated successfully');
    res.json({ message: 'Background image updated successfully', villa });
  } catch (error) {
    console.error('Error updating background image:', error);
    res.status(500).json({ message: 'Error updating background image', error: error.message });
  }
});

// Handle slide images upload
router.post('/slides', upload.array('slideImages', 10), async (req, res) => {
  try {
    console.log('Received slide images upload request');
    console.log('Files:', req.files);

    if (!req.files || req.files.length === 0) {
      console.log('No files received');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const villa = await Villa.findOne();
    if (!villa) {
      console.log('Villa not found');
      return res.status(404).json({ message: 'Villa not found' });
    }

    // Delete old slide images if they exist
    if (villa.slideImages && villa.slideImages.length > 0) {
      villa.slideImages.forEach(imagePath => {
        if (!imagePath) return;
        const relativePath = imagePath.replace('/uploads/', '');
        const fullPath = path.join(__dirname, '../../../uploads', relativePath);
        console.log('Checking old image at:', fullPath);
        if (fs.existsSync(fullPath)) {
          console.log('Deleting old image');
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Save new slide images
    const imageUrls = req.files.map(file => `/uploads/villa/${file.filename}`);
    console.log('New image URLs:', imageUrls);
    
    villa.slideImages = imageUrls;
    await villa.save();

    console.log('Villa updated successfully');
    res.json({ message: 'Slide images updated successfully', villa });
  } catch (error) {
    console.error('Error updating slide images:', error);
    res.status(500).json({ message: 'Error updating slide images', error: error.message });
  }
});

// Delete specific slide image
router.delete('/slides/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const villa = await Villa.findOne();
    
    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }

    if (!villa.slideImages || index >= villa.slideImages.length) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the file
    const imagePath = villa.slideImages[index];
    if (imagePath) {
      const relativePath = imagePath.replace('/uploads/', '');
      const fullPath = path.join(__dirname, '../../../uploads', relativePath);
      console.log('Deleting image at:', fullPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Remove from array
    villa.slideImages.splice(index, 1);
    await villa.save();

    res.json({ message: 'Slide image deleted successfully', villa });
  } catch (error) {
    console.error('Error deleting slide image:', error);
    res.status(500).json({ message: 'Error deleting slide image' });
  }
});

// Reorder slide images
router.patch('/slides/reorder', async (req, res) => {
  try {
    const { newOrder } = req.body;
    const villa = await Villa.findOne();
    
    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }

    if (!Array.isArray(newOrder)) {
      return res.status(400).json({ message: 'Invalid order format' });
    }

    // Create new array based on the order
    const reorderedImages = newOrder.map(index => villa.slideImages[index]);
    villa.slideImages = reorderedImages;
    await villa.save();

    res.json({ message: 'Slide images reordered successfully', villa });
  } catch (error) {
    console.error('Error reordering slide images:', error);
    res.status(500).json({ message: 'Error reordering slide images' });
  }
});

// Upload PromptPay QR code
router.post('/promptpay-qr', qrUpload.single('qrCode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No QR code file uploaded' });
    }

    const villa = await Villa.findOne();
    if (!villa) {
      return res.status(404).json({ message: 'Villa not found' });
    }

    // Delete old QR code if it exists
    if (villa.promptPay?.qrImage) {
      const oldPath = path.join(__dirname, '../../../uploads/QR', path.basename(villa.promptPay.qrImage));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update villa with new QR code path
    villa.promptPay = {
      qrImage: `/uploads/QR/${req.file.filename}`
    };
    await villa.save();

    res.json({ 
      message: 'QR code uploaded successfully',
      qrImage: villa.promptPay.qrImage 
    });
  } catch (error) {
    console.error('Error uploading QR code:', error);
    res.status(500).json({ message: 'Failed to upload QR code' });
  }
});

// Delete PromptPay QR code
router.delete('/promptpay-qr', async (req, res) => {
  try {
    const villa = await Villa.findOne();
    if (!villa || !villa.promptPay?.qrImage) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Delete QR code file
    const qrPath = path.join(__dirname, '../../../uploads/QR', path.basename(villa.promptPay.qrImage));
    if (fs.existsSync(qrPath)) {
      fs.unlinkSync(qrPath);
    }

    // Remove QR code from villa
    villa.promptPay = { qrImage: '' };
    await villa.save();

    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ message: 'Failed to delete QR code' });
  }
});

export default router;
