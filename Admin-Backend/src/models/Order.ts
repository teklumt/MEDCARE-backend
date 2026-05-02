import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
  orderId?: string;
  patientId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  driverId?: Types.ObjectId | null;
  items: {
    medicineId?: Types.ObjectId;
    medicineName?: string;
    quantity: number;
    priceAtOrder: number;
  }[];
  totalAmount: number;
  delivery: {
    method: "pickup" | "delivery";
    address?: {
      region?: string;
      city?: string;
      street?: string;
      coordinates?: { lat?: number; lng?: number };
    };
  };
  payment: {
    method: "chapa" | "cash_on_delivery";
    status: "pending" | "paid" | "failed" | "refunded";
    transactionId?: string;
  };
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  statusHistory?: {
    status?: string;
    updatedBy?: Types.ObjectId;
    updatedByRole?: string;
    note?: string;
    timestamp?: Date;
  }[];
  notes?: {
    patient?: string;
    pharmacist?: string;
  };
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver", default: null, index: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: "Medicine" },
        medicineName: { type: String },
        quantity: { type: Number, required: true },
        priceAtOrder: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    delivery: {
      method: { type: String, enum: ["pickup", "delivery"], required: true },
      address: {
        region: { type: String },
        city: { type: String },
        street: { type: String },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
      },
    },
    payment: {
      method: { type: String, enum: ["chapa", "cash_on_delivery"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
      transactionId: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String },
        updatedBy: { type: Schema.Types.ObjectId },
        updatedByRole: { type: String },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    notes: {
      patient: { type: String },
      pharmacist: { type: String },
    },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true }, strict: false, minimize: false },
);

orderSchema.pre("save", function () {
  if (!this.orderId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `MC-${date}-${rand}`;
  }
});

orderSchema.index({ patientId: 1 });
orderSchema.index({ pharmacyId: 1 });
orderSchema.index({ driverId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);
