const mongoose = require('mongoose');
const { Schema } = mongoose;
const { DAYS_OF_WEEK } = require('../config/constants');

const pharmacySchema = new Schema({
  businessName: { type: String, required: true },
  nameAmharic: { type: String },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  description: { type: String, maxlength: 500 },
  website: { type: String },
  profileImageUrl: { type: String },

  address: {
    region: { type: String },
    city: { type: String },
    street: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  license: {
    licenseNumber: { type: String },
    licenseImageUrl: { type: String },
    tinNumber: { type: String },
    expiryDate: { type: Date },
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected', 'revoked', 'expired'],
      default: 'not_submitted'
    },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date }
  },

  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  suspendedReason: { type: String },
  suspendedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

  isVerifiedBadge: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },

  operatingHours: [{
    day: { type: String, enum: DAYS_OF_WEEK },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String },
    closeTime: { type: String },
    is24Hours: { type: Boolean, default: false }
  }],

  deliverySettings: {
    enabled: { type: Boolean, default: false },
    radiusKm: { type: Number, default: 5 },
    minOrderForFreeDelivery: { type: Number, default: 0 },
    baseDeliveryFee: { type: Number, default: 0 },
    maxConcurrentDeliveries: { type: Number, default: 5 }
  },

  mfa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String }
  },
  
  refreshToken: { type: String }
}, { timestamps: true });

// Indexes
pharmacySchema.index({ 'address.coordinates': '2dsphere' });
pharmacySchema.index({ 'license.status': 1 });
pharmacySchema.index({ status: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
