import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
  ref: string;
  patientId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  deliveryAgentId?: Types.ObjectId | null;
  paymentId?: Types.ObjectId | null;
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress?: {
    recipientName: string;
    phone: string;
    street: string;
    subCity: string;
    city: string;
    additionalInfo?: string;
  };
  deliveryInstructions?: string;
  prescriptionUploadId?: Types.ObjectId | null;
  prescriptionVerified: boolean;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "dispatched"
    | "delivered"
    | "cancelled"
    | "rejected";
  paymentMethod: "chapa" | "cod";
  paymentStatus:
    | "pending"
    | "initiated"
    | "success"
    | "failed"
    | "refunded"
    | "reversed"
    | "cod_pending"
    | "cod_collected";
  items: {
    medicationId: Types.ObjectId;
    medicationName: string;
    genericName?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    requiresPrescription: boolean;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  statusHistory: {
    status: string;
    actorId?: Types.ObjectId;
    note?: string;
    createdAt: Date;
  }[];
  estimatedReadyAt?: Date;
  estimatedDeliveryAt?: Date;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    ref: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    deliveryAgentId: { type: Schema.Types.ObjectId, ref: "DeliveryAgent", default: null, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null, index: true },
    deliveryMethod: { type: String, enum: ["pickup", "delivery"], required: true },
    deliveryAddress: {
      recipientName: { type: String },
      phone: { type: String },
      street: { type: String },
      subCity: { type: String },
      city: { type: String },
      additionalInfo: { type: String },
    },
    deliveryInstructions: { type: String },
    prescriptionUploadId: { type: Schema.Types.ObjectId, ref: "PrescriptionUpload", default: null },
    prescriptionVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "dispatched", "delivered", "cancelled", "rejected"],
      default: "pending",
      index: true,
    },
    paymentMethod: { type: String, enum: ["chapa", "cod"], default: "chapa" },
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "initiated",
        "success",
        "failed",
        "refunded",
        "reversed",
        "cod_pending",
        "cod_collected",
      ],
      default: "pending",
      index: true,
    },
    items: [
      {
        medicationId: { type: Schema.Types.ObjectId, ref: "Medication" },
        medicationName: { type: String, required: true },
        genericName: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        requiresPrescription: { type: Boolean, default: false },
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    statusHistory: [
      {
        status: { type: String },
        actorId: { type: Schema.Types.ObjectId },
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    estimatedReadyAt: { type: Date },
    estimatedDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true, strict: false, minimize: false },
);

orderSchema.index({ ref: 1 }, { unique: true });
orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, status: 1 });
orderSchema.index({ deliveryAgentId: 1, status: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
