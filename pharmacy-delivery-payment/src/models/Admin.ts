import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '../types';

const adminSchema = new Schema<IAdmin>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },

  mfa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String }
  },

  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  
  suspendedReason: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  lastLoginAt: { type: Date },
  refreshToken: { type: String }
}, { timestamps: true });

export default mongoose.model<IAdmin>('Admin', adminSchema);
