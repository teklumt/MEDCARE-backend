import mongoose, { Document, Schema, Types } from "mongoose";

export interface IHealthAlert extends Document {
  createdById: Types.ObjectId;
  type: "Disease Outbreak" | "Medication Recall" | "Emergency Health Advisory";
  region: string;
  message: string;
  details?: string;
  youtubeLink?: string;
  isActive: boolean;
  createdAt: Date;
}

const healthAlertSchema = new Schema<IHealthAlert>(
  {
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["Disease Outbreak", "Medication Recall", "Emergency Health Advisory"],
      required: true,
    },
    region: { type: String, required: true },
    message: { type: String, required: true },
    details: { type: String },
    youtubeLink: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { strict: false, minimize: false },
);

healthAlertSchema.index({ isActive: 1, createdAt: -1 });

export const HealthAlert = mongoose.model<IHealthAlert>("HealthAlert", healthAlertSchema);
