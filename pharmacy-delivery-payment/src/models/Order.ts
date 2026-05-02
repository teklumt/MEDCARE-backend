import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, DELIVERY_METHODS } from '../config/constants';

const orderSchema = new Schema<IOrder>(
  {
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
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (!this.ref) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ref = `ORD-${date}-${rand}`;
  }
  next();
});

orderSchema.index({ ref: 1 }, { unique: true });
orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, status: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);
