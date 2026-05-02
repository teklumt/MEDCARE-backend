import mongoose, { Schema } from 'mongoose';
import { IMedication } from '../types';

const medicationSchema = new Schema<IMedication>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    name: { type: String, required: true, text: true },
    genericName: { type: String },
    category: { type: String },
    dosageForm: { type: String },
    strength: { type: String },
    manufacturer: { type: String },
    batchNumber: { type: String },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
    lowStockThreshold: { type: Number, default: 10 },
    stockStatus: {
      type: String,
      enum: ['adequate', 'low_stock', 'out_of_stock'],
      default: 'adequate'
    },
    requiresPrescription: { type: Boolean, default: false },
    imageUrl: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

medicationSchema.index({ pharmacyId: 1, stockStatus: 1 });
medicationSchema.index({ pharmacyId: 1, category: 1 });
medicationSchema.index({ name: 'text', genericName: 'text' });
medicationSchema.index({ expiryDate: 1 });

export default mongoose.model<IMedication>('Medication', medicationSchema);
