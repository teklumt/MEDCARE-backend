import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  pharmacyId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  isFlagged: boolean;
  flaggedReason?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "EndUser", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isFlagged: { type: Boolean, default: false },
    flaggedReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: false, minimize: false },
);

export const Review = mongoose.model<IReview>("Review", reviewSchema);
