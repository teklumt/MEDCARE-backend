const mongoose = require('mongoose');
const { Schema } = mongoose;
const { INVENTORY_STATUSES } = require('../config/constants');

const inventorySchema = new Schema({
  pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  medicationId: { type: Schema.Types.ObjectId, ref: 'MasterMedication', required: true },
  
  stock: {
    quantity: { type: Number, required: true, default: 0 },
    lowThreshold: { type: Number, default: 10 },
    batchNumber: { type: String },
    expiryDate: { type: Date, required: true }
  },
  
  pricing: {
    costPrice: { type: Number },
    sellingPrice: { type: Number, required: true }
  },
  
  imageUrl: { type: String },
  supplierName: { type: String },
  storageRequirements: { type: String },
  specialInstructions: { type: String },
  
  availability: {
    status: { 
      type: String, 
      enum: INVENTORY_STATUSES,
      default: 'available' 
    },
    deliveryEligible: { type: Boolean, default: true },
    maxOrderQuantity: { type: Number }
  },
  
  prescription: {
    verificationMode: { 
      type: String, 
      enum: ['manual', 'automatic', 'not_required'],
      default: 'manual' 
    },
    validityPeriod: { type: Number } // days
  },
  
  version: { type: Number, default: 1 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  lastRestockedAt: { type: Date },
  
  alerts: {
    expirationWarningSent: { type: Boolean, default: false },
    expirationWarningDate: { type: Date },
    lowStockWarningSent: { type: Boolean, default: false },
    lowStockWarningDate: { type: Date }
  }
}, { timestamps: true });

// Indexes
inventorySchema.index({ pharmacyId: 1, medicationId: 1 });
inventorySchema.index({ pharmacyId: 1, 'availability.status': 1 });
inventorySchema.index({ 'stock.expiryDate': 1 });
inventorySchema.index({ pharmacyId: 1, isDeleted: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
