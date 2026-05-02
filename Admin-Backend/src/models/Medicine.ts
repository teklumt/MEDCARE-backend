import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMedicine extends Document {
  pharmacyId: Types.ObjectId;
  drugName: string;
  genericName?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  stock: {
    quantity: number;
    unit?: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops" | "other";
    lowThreshold?: number;
    batchNumber?: string;
    expiryDate?: Date;
  };
  pricing: {
    costPrice?: number;
    sellingPrice: number;
  };
  requiresPrescription: boolean;
  isAvailable: boolean;
  lastRestockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    drugName: { type: String, required: true },
    genericName: { type: String },
    brand: { type: String },
    category: { type: String },
    imageUrl: { type: String },
    stock: {
      quantity: { type: Number, required: true, default: 0 },
      unit: { type: String, enum: ["tablet", "capsule", "syrup", "injection", "cream", "drops", "other"] },
      lowThreshold: { type: Number, default: 10 },
      batchNumber: { type: String },
      expiryDate: { type: Date },
    },
    pricing: {
      costPrice: { type: Number },
      sellingPrice: { type: Number, required: true },
    },
    requiresPrescription: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true, strict: false, minimize: false },
);

medicineSchema.index({ pharmacyId: 1 });
medicineSchema.index({ drugName: "text", genericName: "text" });
medicineSchema.index({ "stock.expiryDate": 1 });

export const Medicine = mongoose.model<IMedicine>("Medicine", medicineSchema);
