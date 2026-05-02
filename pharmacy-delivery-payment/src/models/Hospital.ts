import mongoose, { Schema } from 'mongoose';
import { IHospital } from '../types';

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, text: true },
    address: { type: String },
    phone: { type: String },
    specialties: { type: [String], default: [] },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

hospitalSchema.index({ coordinates: '2dsphere' });
hospitalSchema.index({ name: 'text' });

export default mongoose.model<IHospital>('Hospital', hospitalSchema);
