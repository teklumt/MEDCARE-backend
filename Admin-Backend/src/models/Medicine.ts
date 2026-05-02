import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMedicine extends Document {
  pharmacyId: Types.ObjectId;
  name: string;
  genericName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: Date;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: "adequate" | "low_stock" | "out_of_stock";
  requiresPrescription: boolean;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    name: { type: String, required: true },
    genericName: { type: String },
    category: { type: String },
    dosageForm: { type: String },
    strength: { type: String },
    manufacturer: { type: String },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    stockStatus: {
      type: String,
      enum: ["adequate", "low_stock", "out_of_stock"],
      default: "adequate",
      index: true,
    },
    requiresPrescription: { type: Boolean, default: false },
    imageUrl: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false, minimize: false },
);

medicineSchema.index({ pharmacyId: 1, stockStatus: 1 });
medicineSchema.index({ pharmacyId: 1, category: 1 });
medicineSchema.index({ name: "text", genericName: "text" });
medicineSchema.index({ expiryDate: 1 });

export const Medicine = mongoose.model<IMedicine>("Medication", medicineSchema);
