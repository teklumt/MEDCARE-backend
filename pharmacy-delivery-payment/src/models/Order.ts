import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, DELIVERY_METHODS } from '../config/constants';

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true, sparse: true },
    ref: { type: String, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    deliveryMethod: { type: String, enum: DELIVERY_METHODS, required: true },
    deliveryAddress: {
      recipientName: { type: String },
      phone: { type: String },
      street: { type: String },
      subCity: { type: String },
      city: { type: String },
      additionalInfo: { type: String }
    },
    deliveryInstructions: { type: String },
    prescriptionUploadId: { type: Schema.Types.ObjectId, ref: 'PrescriptionUpload', default: null },
    prescriptionVerified: { type: Boolean, default: false },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    items: [
      {
        medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
        medicationName: { type: String, required: true },
        genericName: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        requiresPrescription: { type: Boolean, default: false }
      }
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    statusHistory: [
      {
        status: { type: String, required: true },
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: null },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    estimatedReadyAt: { type: Date },
    estimatedDeliveryAt: { type: Date },
    deliveredAt: { type: Date }
  },
  { 
    timestamps: true,
    strict: true,
    strictQuery: true
  }
);

orderSchema.pre('save', function (next) {
  if (!this.ref && !this.orderId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ref = `ORD-${date}-${rand}`;
    this.orderId = `MC-${date}-${rand}`;
  } else {
    if (!this.ref && this.orderId) {
      this.ref = String(this.orderId).replace(/^MC-/, 'ORD-');
    }
    if (!this.orderId && this.ref) {
      this.orderId = String(this.ref).replace(/^ORD-/, 'MC-');
    }
  }
  next();
});

orderSchema.index({ orderId: 1 }, { unique: true, sparse: true });
orderSchema.index({ ref: 1 }, { unique: true });
orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, status: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Delete any existing model to prevent schema caching issues
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}
if (mongoose.models.order) {
  delete mongoose.models.order;
}
if (mongoose.models.orders) {
  delete mongoose.models.orders;
}

export default mongoose.model<IOrder>('Order', orderSchema, 'orders');
