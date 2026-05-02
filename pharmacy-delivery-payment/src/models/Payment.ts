import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../types';

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    txRef: { type: String, required: true, unique: true },
    chapaReference: { type: String },
    checkoutUrl: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETB' },
    chapaCharge: { type: Number },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true },
    chapaStatus: { type: String },
    mode: { type: String },
    webhookReceivedAt: { type: Date },
    verifiedAt: { type: Date },
    webhookPayload: { type: Schema.Types.Mixed },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date, default: null }
  },
  { timestamps: true }
);

paymentSchema.index({ txRef: 1 }, { unique: true });
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
