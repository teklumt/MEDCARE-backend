import mongoose, { Schema } from 'mongoose';
import { IPlatformConfig } from '../types';

const platformConfigSchema = new Schema<IPlatformConfig>(
  {
    value: { type: String, required: true }
  },
  { timestamps: false }
);

export default mongoose.model<IPlatformConfig>('PlatformConfig', platformConfigSchema);
