import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDiseaseAlert extends Document {
  title: string;
  description: string;
  alertType: "malaria" | "cholera" | "marburg" | "other";
  severity: "low" | "moderate" | "high" | "critical";
  affectedRegions: string[];
  affectedCities: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  sentCount: number;
  deliveredCount: number;
}

const diseaseAlertSchema = new Schema<IDiseaseAlert>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    alertType: { type: String, enum: ["malaria", "cholera", "marburg", "other"], required: true },
    severity: { type: String, enum: ["low", "moderate", "high", "critical"], required: true, index: true },
    affectedRegions: { type: [String], default: [] },
    affectedCities: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
  },
  { strict: false, minimize: false },
);

export const DiseaseAlert = mongoose.model<IDiseaseAlert>("DiseaseAlert", diseaseAlertSchema);
