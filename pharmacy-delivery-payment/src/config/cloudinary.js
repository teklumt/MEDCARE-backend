const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for medication images
const medicationStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pharmacy/medications',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

// Storage for prescription images
const prescriptionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pharmacy/prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 1200, height: 1600, crop: 'limit' }]
  }
});

// Storage for license documents
const licenseStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pharmacy/licenses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  }
});

// Storage for profile images
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pharmacy/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
});

// File size limit: 5MB
const fileSizeLimit = 5 * 1024 * 1024;

// Multer upload instances
const uploadMedication = multer({ 
  storage: medicationStorage,
  limits: { fileSize: fileSizeLimit }
});

const uploadPrescription = multer({ 
  storage: prescriptionStorage,
  limits: { fileSize: fileSizeLimit }
});

const uploadLicense = multer({ 
  storage: licenseStorage,
  limits: { fileSize: fileSizeLimit }
});

const uploadProfile = multer({ 
  storage: profileStorage,
  limits: { fileSize: fileSizeLimit }
});

// Helper function to delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = urlParts.slice(-3, -1).join('/');
    
    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  uploadMedication,
  uploadPrescription,
  uploadLicense,
  uploadProfile,
  deleteImage
};
