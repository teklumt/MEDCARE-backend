import mongoose, { Schema } from 'mongoose';
import { IReview } from '../types';

const reviewSchema = new Schema<IReview>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

reviewSchema.index({ pharmacyId: 1, patientId: 1 }, { unique: true });
reviewSchema.index({ pharmacyId: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', reviewSchema);
