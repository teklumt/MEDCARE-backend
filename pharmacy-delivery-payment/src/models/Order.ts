import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, DELIVERY_METHODS } from '../config/constants';

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },

  items: [{
    medicineId: { type: Schema.Types.ObjectId, ref: 'Inventory' },
    medicineName: { type: String },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true }
  }],

  totalAmount: { type: Number, required: true },

  delivery: {
    method: { type: String, enum: DELIVERY_METHODS, required: true },
    address: {
      region: { type: String },
      city: { type: String },
      street: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }
  },

  payment: {
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending'
    },
    transactionId: { type: String }
  },

  status: {
    type: String,
    enum: ORDER_STATUSES,
    default: 'pending'
  },

  statusHistory: [{
    status: { type: String },
    updatedBy: { type: Schema.Types.ObjectId },
    updatedByRole: { type: String },
    note: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],

  notes: {
    patient: { type: String },
    pharmacist: { type: String }
  },

  prescriptionImageUrl: { type: String },
  estimatedPreparationTime: { type: Number },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: { type: Date },
  stockReserved: { type: Boolean, default: false },

  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String }
}, { timestamps: true });

// Auto-generate orderId
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `MC-${date}-${rand}`;
  }
  next();
});

// Indexes
orderSchema.index({ patientId: 1 });
orderSchema.index({ pharmacyId: 1 });
orderSchema.index({ driverId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ pharmacyId: 1, status: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
