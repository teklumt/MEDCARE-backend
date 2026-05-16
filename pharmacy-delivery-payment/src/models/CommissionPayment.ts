import mongoose, { Schema } from 'mongoose';
import { ICommissionPayment } from '../types';

const commissionPaymentSchema = new Schema<ICommissionPayment>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    txRef: { type: String, required: true, unique: true },
    checkoutUrl: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETB' },
    chapaCharge: { type: Number },
    paymentMethod: { type: String, required: true },
    status: { type: String, required: true },
    chapaStatus: { type: String },
    chapaReference: { type: String },
    mode: { type: String },
    webhookReceivedAt: { type: Date },
    verifiedAt: { type: Date },
    webhookPayload: { type: Schema.Types.Mixed },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date, default: null }
  },
  { timestamps: true, collection: 'commission_payments' }
);

commissionPaymentSchema.index({ pharmacyId: 1, createdAt: -1 });
commissionPaymentSchema.index({ status: 1 });

export default mongoose.model<ICommissionPayment>('CommissionPayment', commissionPaymentSchema);
