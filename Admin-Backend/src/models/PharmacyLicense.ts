import mongoose, { Document, Schema, Types } from "mongoose";

export type LicenseStatus = "pending" | "verified" | "rejected" | "expired" | "revoked";

interface VerificationHistory {
  adminId: Types.ObjectId;
  action: string;
  note?: string;
  timestamp: Date;
}

export interface IPharmacyLicense extends Document {
  pharmacyId: Types.ObjectId;
  licenseNumber: string;
  licenseImageUrl: string;
  businessName: string;
  ownerName: string;
  tinNumber: string;
  region: string;
  city: string;
  address: string;
  submittedAt: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  status: LicenseStatus;
  rejectionReason?: string;
  expiryDate?: Date;
  notes: string[];
  verificationHistory: VerificationHistory[];
}

const pharmacyLicenseSchema = new Schema<IPharmacyLicense>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseImageUrl: { type: String, required: true },
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    tinNumber: { type: String, required: true },
    region: { type: String, required: true, index: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },
    status: { type: String, enum: ["pending", "verified", "rejected", "expired", "revoked"], default: "pending", index: true },
    rejectionReason: { type: String },
    expiryDate: { type: Date, index: true },
    notes: { type: [String], default: [] },
    verificationHistory: [
      {
        adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
        action: { type: String, required: true },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { strict: false, minimize: false },
);

export const PharmacyLicense = mongoose.model<IPharmacyLicense>("PharmacyLicense", pharmacyLicenseSchema);
