import Joi from 'joi';

export const userSignupSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().lowercase().trim(),
  phone: Joi.string().required().pattern(/^\+251[79]\d{8}$/).message('Phone must be Ethiopian format: +251XXXXXXXXX'),
  password: Joi.string().required().min(8).max(50),
  region: Joi.string().optional().trim(),
  city: Joi.string().optional().trim()
});

export const pharmacySignupSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().lowercase().trim(),
  phone: Joi.string().required().pattern(/^\+251[79]\d{8}$/).message('Phone must be Ethiopian format: +251XXXXXXXXX'),
  password: Joi.string().required().min(8).max(50),
  businessName: Joi.string().required().trim().min(2).max(200),
  businessNameAmharic: Joi.string().optional().trim(),
  licenseNumber: Joi.string().required().trim(),
  licenseImageUrl: Joi.string().required().uri(),
  tinNumber: Joi.string().optional().trim(),
  address: Joi.object({
    region: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().required().min(-90).max(90),
      lng: Joi.number().required().min(-180).max(180)
    }).optional()
  }).required()
});

export const deliverySignupSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().lowercase().trim(),
  phone: Joi.string().required().pattern(/^\+251[79]\d{8}$/).message('Phone must be Ethiopian format: +251XXXXXXXXX'),
  password: Joi.string().required().min(8).max(50),
  vehicleType: Joi.string().required().valid('motorcycle', 'bicycle', 'car'),
  vehiclePlate: Joi.string().optional().trim(),
  nationalId: Joi.string().optional().trim(),
  driverLicenseNumber: Joi.string().optional().trim()
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string().required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});
