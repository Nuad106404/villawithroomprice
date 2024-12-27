import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const slipsUploadDir = path.join(uploadsDir, 'slips');
const villaUploadDir = path.join(uploadsDir, 'villa');

// Create all necessary directories
[uploadsDir, slipsUploadDir, villaUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log('Creating directory:', dir);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Log the paths for debugging
console.log('Uploads directory paths:');
console.log('Base uploads dir:', uploadsDir);
console.log('Slips dir:', slipsUploadDir);
console.log('Villa dir:', villaUploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Choose directory based on upload type
    const uploadDir = file.fieldname === 'backgroundImage' || file.fieldname === 'slideImages' 
      ? villaUploadDir 
      : slipsUploadDir;
    console.log('File field name:', file.fieldname);
    console.log('Uploading to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = path.parse(file.originalname).name;
    const finalFilename = `${filename}-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log('Generated filename:', finalFilename);
    cb(null, finalFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  console.log('File mimetype:', file.mimetype);
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
