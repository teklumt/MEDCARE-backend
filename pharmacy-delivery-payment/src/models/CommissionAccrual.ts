import mongoose, { Schema } from 'mongoose';
import { ICommissionAccrual } from '../types';

const commissionAccrualSchema = new Schema<ICommissionAccrual>(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    amountEtb: { type: Number, required: true }
  },
  { timestamps: true, collection: 'commission_accruals' }
);

commissionAccrualSchema.index({ pharmacyId: 1, createdAt: -1 });

export default mongoose.model<ICommissionAccrual>('CommissionAccrual', commissionAccrualSchema);
