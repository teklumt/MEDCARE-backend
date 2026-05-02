import mongoose, { Document, Schema, Types } from "mongoose";
import type { AdminRole } from "../types/auth.js";

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  mfa: {
    enabled: boolean;
    secret?: string;
  };
  status: "active" | "suspended";
  suspendedReason?: string;
  createdBy?: Types.ObjectId;
  permissions?: string[];
  lastLoginAt?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "admin", "moderator"], default: "admin", required: true },
    mfa: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    suspendedReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    permissions: { type: [String], default: [] },
    lastLoginAt: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true, strict: false, minimize: false },
);

adminSchema.index({ role: 1, createdAt: -1 });

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
