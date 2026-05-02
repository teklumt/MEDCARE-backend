import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  pharmacyId: Types.ObjectId;
  patientId: Types.ObjectId;
  patientName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: false, minimize: false },
);

reviewSchema.index({ pharmacyId: 1, patientId: 1 }, { unique: true });
reviewSchema.index({ pharmacyId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
