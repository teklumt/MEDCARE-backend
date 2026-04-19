const mongoose = require('mongoose');
const { Schema } = mongoose;
const { DRIVER_STATUSES } = require('../config/constants');

const driverSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },

  nationalId: { type: String },
  licenseNumber: { type: String },
  licenseImageUrl: { type: String },

  vehicle: {
    type: { type: String, enum: ['motorcycle', 'bicycle', 'car'] },
    plate: { type: String }
  },

  region: { type: String },
  city: { type: String },

  assignedPharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', default: null },

  status: {
    type: String,
    enum: DRIVER_STATUSES,
    default: 'offline'
  },

  backgroundCheck: {
    status: {
      type: String,
      enum: ['pending', 'cleared', 'failed'],
      default: 'pending'
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date }
  },

  isSuspended: { type: Boolean, default: false },
  suspendedReason: { type: String },
  suspendedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  
  activeDeliveryCount: { type: Number, default: 0 },
  maxConcurrentDeliveries: { type: Number, default: 5 },
  
  currentLocation: {
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    lastUpdated: { type: Date }
  },
  
  performance: {
    totalDeliveries: { type: Number, default: 0 },
    completedOnTime: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number },
    completionRate: { type: Number, default: 100 }
  },
  
  refreshToken: { type: String }
}, { timestamps: true });

// Indexes
driverSchema.index({ status: 1 });
driverSchema.index({ assignedPharmacyId: 1 });

module.exports = mongoose.model('Driver', driverSchema);
