import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "patient" | "pharmacy" | "delivery" | "admin";
  language: "en" | "am";
  isActive: boolean;
  isLocked: boolean;
  lockExpiresAt?: Date | null;
  failedLoginAttempts: number;
  mfa: {
    enabled: boolean;
    secret?: string | null;
    backupCodes: string[];
  };
  addresses: {
    label: string;
    recipientName: string;
    phone: string;
    street: string;
    subCity: string;
    city: string;
    additionalInfo?: string;
    isDefault: boolean;
  }[];
  refreshToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "pharmacy", "delivery", "admin"], required: true, index: true },
    language: { type: String, enum: ["en", "am"], default: "en" },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
    lockExpiresAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    mfa: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, default: null },
      backupCodes: { type: [String], default: [] },
    },
    addresses: {
      type: [
        {
          label: { type: String, required: true },
          recipientName: { type: String, required: true },
          phone: { type: String, required: true },
          street: { type: String, required: true },
          subCity: { type: String, required: true },
          city: { type: String, required: true },
          additionalInfo: { type: String },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    refreshToken: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, strict: false, minimize: false },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
