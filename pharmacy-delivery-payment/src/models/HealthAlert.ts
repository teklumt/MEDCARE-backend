import mongoose, { Schema } from 'mongoose';
import { IHealthAlert } from '../types';

const healthAlertSchema = new Schema<IHealthAlert>(
  {
    createdById: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['Disease Outbreak', 'Medication Recall', 'Emergency Health Advisory'],
      required: true
    },
    region: { type: String, required: true },
    message: { type: String, required: true },
    details: { type: String },
    youtubeLink: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

healthAlertSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model<IHealthAlert>('HealthAlert', healthAlertSchema);
