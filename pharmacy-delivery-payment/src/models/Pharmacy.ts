import mongoose, { Schema } from 'mongoose';
import { IPharmacy } from '../types';

const pharmacySchema = new Schema<IPharmacy>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true, text: true },
    location: { type: String },
    address: { type: String },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    phone: { type: String },
    email: { type: String },
    description: { type: String },
    openingHours: { type: String },
    deliveryAvailable: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 0 },
    deliveryRadiusKm: { type: Number, default: 5 },
    license: {
      businessLicenseNumber: { type: String },
      businessLicenseExpiry: { type: Date },
      professionalLicenseExpiry: { type: Date }
    },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'reviewing', 'approved', 'rejected', 'needs_docs'],
        default: 'pending'
      },
      verifiedAt: { type: Date },
      verifiedById: { type: Schema.Types.ObjectId, ref: 'User' },
      rejectionNote: { type: String, default: null },
      documents: {
        businessRegistration: {
          url: { type: String },
          status: { type: String },
          uploadedAt: { type: Date }
        },
        operatingLicense: {
          url: { type: String },
          status: { type: String },
          uploadedAt: { type: Date }
        },
        inspectionReport: {
          url: { type: String },
          status: { type: String },
          uploadedAt: { type: Date }
        }
      }
    },
    stats: {
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true }
  },
  { timestamps: true }
);

pharmacySchema.index({ coordinates: '2dsphere' });
pharmacySchema.index({ 'verification.status': 1 });
pharmacySchema.index({ ownerId: 1 });
pharmacySchema.index({ businessName: 'text' });

export default mongoose.model<IPharmacy>('Pharmacy', pharmacySchema);
