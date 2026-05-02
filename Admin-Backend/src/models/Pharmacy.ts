import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPharmacy extends Document {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  passwordHash: string;
  address: {
    region?: string;
    city?: string;
    street?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  license: {
    licenseNumber?: string;
    licenseImageUrl?: string;
    tinNumber?: string;
    expiryDate?: Date;
    status: "not_submitted" | "pending" | "verified" | "rejected" | "revoked" | "expired";
    rejectionReason?: string;
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    notes?: string[];
    verificationHistory?: { adminId: Types.ObjectId; action: string; note?: string; timestamp: Date }[];
  };
  status: "active" | "suspended" | "deactivated";
  suspendedReason?: string;
  suspendedBy?: Types.ObjectId;
  isVerifiedBadge: boolean;
  rating: number;
  totalRatings: number;
  operatingHours?: {
    open?: string;
    close?: string;
    days?: string[];
  };
  mfa: {
    enabled: boolean;
    secret?: string;
  };
  refreshToken?: string;
  totalOrders?: number;
  totalRevenue?: number;
  lastActiveAt?: Date;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    businessName: { type: String, required: true, index: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    address: {
      region: { type: String },
      city: { type: String },
      street: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    license: {
      licenseNumber: { type: String },
      licenseImageUrl: { type: String },
      tinNumber: { type: String },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ["not_submitted", "pending", "verified", "rejected", "revoked", "expired"],
        default: "not_submitted",
      },
      rejectionReason: { type: String },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      reviewedAt: { type: Date },
      notes: { type: [String], default: [] },
      verificationHistory: [
        {
          adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
          action: { type: String },
          note: { type: String },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
    status: { type: String, enum: ["active", "suspended", "deactivated"], default: "active", index: true },
    suspendedReason: { type: String },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    isVerifiedBadge: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    totalRatings: { type: Number, default: 0 },
    operatingHours: {
      open: { type: String },
      close: { type: String },
      days: [{ type: String }],
    },
    mfa: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },
    refreshToken: { type: String },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
  },
  { timestamps: true, strict: false, minimize: false },
);

pharmacySchema.index({ "address.coordinates": "2dsphere" });
pharmacySchema.index({ "license.status": 1 });
pharmacySchema.index({ status: 1 });

export const Pharmacy = mongoose.model<IPharmacy>("Pharmacy", pharmacySchema);
