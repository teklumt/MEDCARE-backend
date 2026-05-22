import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const addressSchema = new Schema(
  {
    label: { type: String },
    recipientName: { type: String },
    phone: { type: String },
    street: { type: String },
    subCity: { type: String },
    city: { type: String },
    additionalInfo: { type: String },
    isDefault: { type: Boolean, default: false },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }
    }
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'pharmacy', 'admin', 'delivery'], default: 'patient' },
    language: { type: String, enum: ['en', 'am'], default: 'en' },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
    lockExpiresAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    mfa: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, default: null },
      backupCodes: { type: [String], default: [] }
    },
    addresses: { type: [addressSchema], default: [] },
    profilePhotoUrl: { type: String }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', userSchema);
