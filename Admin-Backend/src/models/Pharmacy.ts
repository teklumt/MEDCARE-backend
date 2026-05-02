import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPharmacy extends Document {
  ownerId: Types.ObjectId;
  businessName: string;
  location?: string;
  address?: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };
  phone: string;
  email: string;
  description?: string;
  openingHours?: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
  license: {
    businessLicenseNumber?: string;
    businessLicenseExpiry?: Date;
    professionalLicenseExpiry?: Date;
  };
  verification: {
    status: "pending" | "reviewing" | "approved" | "rejected" | "needs_docs";
    verifiedAt?: Date;
    verifiedById?: Types.ObjectId;
    rejectionNote?: string | null;
    documents?: {
      businessRegistration?: { url?: string; status?: string; uploadedAt?: Date };
      operatingLicense?: { url?: string; status?: string; uploadedAt?: Date };
      inspectionReport?: { url?: string; status?: string; uploadedAt?: Date };
    };
  };
  stats: {
    rating: number;
    reviewCount: number;
  };
  isActive: boolean;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessName: { type: String, required: true, index: true },
    location: { type: String },
    address: { type: String },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String },
    openingHours: { type: String },
    deliveryAvailable: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 0 },
    license: {
      businessLicenseNumber: { type: String },
      businessLicenseExpiry: { type: Date },
      professionalLicenseExpiry: { type: Date },
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "reviewing", "approved", "rejected", "needs_docs"],
        default: "pending",
        index: true,
      },
      verifiedAt: { type: Date },
      verifiedById: { type: Schema.Types.ObjectId, ref: "User" },
      rejectionNote: { type: String, default: null },
      documents: {
        businessRegistration: {
          url: { type: String },
          status: { type: String },
          uploadedAt: { type: Date },
        },
        operatingLicense: {
          url: { type: String },
          status: { type: String },
          uploadedAt: { type: Date },
        },
        inspectionReport: {
          url: { type: String },
          status: { type: String },
          uploadedAt: { type: Date },
        },
      },
    },
    stats: {
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false, minimize: false },
);

pharmacySchema.index({ coordinates: "2dsphere" });
pharmacySchema.index({ "verification.status": 1 });
pharmacySchema.index({ ownerId: 1 });
pharmacySchema.index({ businessName: "text" });

export const Pharmacy = mongoose.model<IPharmacy>("Pharmacy", pharmacySchema);
