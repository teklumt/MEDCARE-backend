import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacyDeliveryUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'user' | 'pharmacy' | 'delivery';
  
  // Pharmacy specific fields
  businessName?: string;
  businessNameAmharic?: string;
  licenseNumber?: string;
  licenseImageUrl?: string;
  tinNumber?: string;
  address?: {
    region?: string;
    city?: string;
    street?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Delivery specific fields
  vehicleType?: 'motorcycle' | 'bicycle' | 'car';
  vehiclePlate?: string;
  nationalId?: string;
  driverLicenseNumber?: string;
  assignedPharmacyId?: mongoose.Types.ObjectId;
  
  // User specific fields (for regular customers)
  region?: string;
  city?: string;
  
  // Common fields
  status: 'active' | 'suspended' | 'pending_verification';
  isVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pharmacyDeliveryUserSchema = new Schema<IPharmacyDeliveryUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'pharmacy', 'delivery'], required: true },
  
  // Pharmacy specific
  businessName: { type: String },
  businessNameAmharic: { type: String },
  licenseNumber: { type: String },
  licenseImageUrl: { type: String, required: function(this: IPharmacyDeliveryUser) { return this.role === 'pharmacy'; } },
  tinNumber: { type: String },
  address: {
    region: { type: String },
    city: { type: String },
    street: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  // Delivery specific
  vehicleType: { type: String, enum: ['motorcycle', 'bicycle', 'car'] },
  vehiclePlate: { type: String },
  nationalId: { type: String },
  driverLicenseNumber: { type: String },
  assignedPharmacyId: { type: Schema.Types.ObjectId, ref: 'PharmacyDeliveryUser' },
  
  // User specific (regular customers)
  region: { type: String },
  city: { type: String },
  
  // Common
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'pending_verification'],
    default: function(this: IPharmacyDeliveryUser) {
      return this.role === 'pharmacy' ? 'pending_verification' : 'active';
    }
  },
  isVerified: { 
    type: Boolean, 
    default: function(this: IPharmacyDeliveryUser) {
      return this.role !== 'pharmacy';
    }
  },
  refreshToken: { type: String }
}, { 
  timestamps: true,
  collection: 'pharmacy-delivery-users'
});

// Indexes
pharmacyDeliveryUserSchema.index({ email: 1 });
pharmacyDeliveryUserSchema.index({ phone: 1 });
pharmacyDeliveryUserSchema.index({ role: 1 });
pharmacyDeliveryUserSchema.index({ status: 1 });

export default mongoose.model<IPharmacyDeliveryUser>('PharmacyDeliveryUser', pharmacyDeliveryUserSchema);
