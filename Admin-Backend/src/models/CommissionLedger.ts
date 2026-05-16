import mongoose, { Schema } from "mongoose";

const commissionAccrualSchema = new Schema(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    amountEtb: { type: Number, required: true },
  },
  { timestamps: true, collection: "commission_accruals", strict: true },
);

export const CommissionAccrualModel =
  (mongoose.models.CommissionLedgerAccrual as mongoose.Model<unknown>) ||
  mongoose.model("CommissionLedgerAccrual", commissionAccrualSchema);

const commissionPaymentSchema = new Schema(
  {
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    txRef: { type: String, required: true, unique: true },
    checkoutUrl: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ETB" },
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
    lastRetryAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "commission_payments", strict: true },
);

commissionPaymentSchema.index({ pharmacyId: 1 });

export const CommissionPaymentModel =
  (mongoose.models.CommissionLedgerPayment as mongoose.Model<unknown>) ||
  mongoose.model("CommissionLedgerPayment", commissionPaymentSchema);
