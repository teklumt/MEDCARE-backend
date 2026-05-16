import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('🔍 Checking Cloudinary config:', {
    cloudName: cloudName ? '✓' : '✗',
    apiKey: apiKey ? '✓' : '✗',
    apiSecret: apiSecret ? '✓' : '✗',
    isPlaceholder: cloudName === 'your_cloud_name'
  });
  
  return !!(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== 'your_cloud_name'
  );
};

// Configure Cloudinary if credentials are available
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured');
} else {
  console.log('⚠️  Cloudinary not configured, using local storage');
}

// Local storage configuration
const uploadDir = path.join(process.cwd(), 'uploads');
const prescriptionsDir = path.join(uploadDir, 'prescriptions');

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(prescriptionsDir)) {
  fs.mkdirSync(prescriptionsDir, { recursive: true });
}

// Local storage for prescriptions
const localPrescriptionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, prescriptionsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `prescription-${uniqueSuffix}${ext}`);
  }
});

// Cloudinary storage for prescriptions
const cloudinaryPrescriptionStorage = isCloudinaryConfigured()
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'pharmacy/prescriptions',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        transformation: [{ width: 1200, height: 1600, crop: 'limit' }]
      } as any
    })
  : null;

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
  }
};

// File size limit: 5MB
const fileSizeLimit = 5 * 1024 * 1024;

// Export multer upload instance
export const uploadPrescription = multer({
  storage: cloudinaryPrescriptionStorage || localPrescriptionStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: fileFilter
});

/** In-memory only; forwards to OCR webhook (no persistence). Max 10MB per integration spec. */
export const scanPrescriptionMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

// Helper to get file URL
export const getFileUrl = (file: Express.Multer.File): string => {
  // Check if file was uploaded to Cloudinary (has path property from CloudinaryStorage)
  if ((file as any).path && typeof (file as any).path === 'string' && (file as any).path.includes('cloudinary')) {
    // Cloudinary URL
    return (file as any).path;
  } else if (isCloudinaryConfigured() && (file as any).path) {
    // Cloudinary is configured and file has path
    return (file as any).path;
  } else {
    // Local file URL
    const baseUrl = process.env.APP_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/prescriptions/${file.filename}`;
  }
};

export { cloudinary, isCloudinaryConfigured };
