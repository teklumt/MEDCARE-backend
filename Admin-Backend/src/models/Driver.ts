import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDriver extends Document {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  nationalId?: string;
  licenseNumber?: string;
  licenseImageUrl?: string;
  vehicle: {
    type?: "motorcycle" | "bicycle" | "car";
    plate?: string;
  };
  region?: string;
  city?: string;
  assignedPharmacyId?: Types.ObjectId | null;
  status: "available" | "on_delivery" | "offline" | "suspended";
  backgroundCheck: {
    status: "pending" | "cleared" | "failed";
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
  };
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  suspendedBy?: Types.ObjectId;
  totalDeliveries: number;
  rating: number;
  refreshToken?: string;
  lastDeliveryAt?: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    fullName: { type: String, required: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: true },
    nationalId: { type: String },
    licenseNumber: { type: String },
    licenseImageUrl: { type: String },
    vehicle: {
      type: { type: String, enum: ["motorcycle", "bicycle", "car"] },
      plate: { type: String },
    },
    region: { type: String, index: true },
    city: { type: String },
    assignedPharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", default: null, index: true },
    status: {
      type: String,
      enum: ["available", "on_delivery", "offline", "suspended"],
      default: "offline",
      index: true,
    },
    backgroundCheck: {
      status: { type: String, enum: ["pending", "cleared", "failed"], default: "pending" },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
      reviewedAt: { type: Date },
    },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    refreshToken: { type: String },
    lastDeliveryAt: { type: Date },
  },
  { timestamps: true, strict: false, minimize: false },
);

driverSchema.index({ status: 1 });
driverSchema.index({ assignedPharmacyId: 1 });

export const Driver = mongoose.model<IDriver>("Driver", driverSchema);
