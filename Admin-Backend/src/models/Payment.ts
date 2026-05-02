import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  patientId: Types.ObjectId;
  txRef: string;
  chapaReference?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  chapaCharge?: number;
  paymentMethod: "telebirr" | "cbe_birr" | "mpesa" | "ebirr" | "chapa" | "cod";
  status:
    | "initiated"
    | "pending"
    | "success"
    | "failed"
    | "refunded"
    | "reversed"
    | "cod_pending"
    | "cod_collected";
  chapaStatus?: string;
  mode?: "test" | "live";
  webhookReceivedAt?: Date;
  verifiedAt?: Date;
  webhookPayload?: Record<string, unknown>;
  retryCount: number;
  lastRetryAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    txRef: { type: String, required: true, unique: true, index: true },
    chapaReference: { type: String },
    checkoutUrl: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ETB" },
    chapaCharge: { type: Number },
    paymentMethod: {
      type: String,
      enum: ["telebirr", "cbe_birr", "mpesa", "ebirr", "chapa", "cod"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "initiated",
        "pending",
        "success",
        "failed",
        "refunded",
        "reversed",
        "cod_pending",
        "cod_collected",
      ],
      default: "initiated",
      index: true,
    },
    chapaStatus: { type: String },
    mode: { type: String, enum: ["test", "live"], default: "test" },
    webhookReceivedAt: { type: Date },
    verifiedAt: { type: Date },
    webhookPayload: { type: Schema.Types.Mixed },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false, minimize: false },
);

paymentSchema.index({ txRef: 1 }, { unique: true });
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
