import mongoose, { Schema } from 'mongoose';
import { IPlatformConfig } from '../types';

const platformConfigSchema = new Schema<IPlatformConfig>(
  {
    key: { type: String, trim: true, unique: true, sparse: true },
    value: { type: String, required: true }
  },
  { timestamps: true, strict: false }
);

export default mongoose.model<IPlatformConfig>('PlatformConfig', platformConfigSchema);
