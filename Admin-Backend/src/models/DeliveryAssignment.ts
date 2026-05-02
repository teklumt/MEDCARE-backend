import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDeliveryAssignment extends Document {
  ref: string;
  orderId: Types.ObjectId;
  agentId: Types.ObjectId;
  pharmacyId: Types.ObjectId;
  snapshot: {
    pharmacyName: string;
    pharmacyAddress: string;
    patientName: string;
    patientPhone: string;
    patientAddress: string;
    patientArea?: string;
    deliveryInstructions?: string;
    distanceText?: string;
    medications: string[];
  };
  paymentMethod: "cod" | "chapa";
  codAmount?: number;
  status: "new_assignment" | "in_progress" | "completed" | "declined";
  activeStep: 1 | 2 | 3 | 4;
  declineReason?: string | null;
  photoProofUrl?: string | null;
  cashCollected?: number | null;
  assignedAt: Date;
  completedAt?: Date | null;
  updatedAt: Date;
}

const deliveryAssignmentSchema = new Schema<IDeliveryAssignment>(
  {
    ref: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true, index: true },
    agentId: { type: Schema.Types.ObjectId, ref: "DeliveryAgent", required: true, index: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    snapshot: {
      pharmacyName: { type: String, required: true },
      pharmacyAddress: { type: String, required: true },
      patientName: { type: String, required: true },
      patientPhone: { type: String, required: true },
      patientAddress: { type: String, required: true },
      patientArea: { type: String },
      deliveryInstructions: { type: String },
      distanceText: { type: String },
      medications: { type: [String], default: [] },
    },
    paymentMethod: { type: String, enum: ["cod", "chapa"], required: true },
    codAmount: { type: Number },
    status: {
      type: String,
      enum: ["new_assignment", "in_progress", "completed", "declined"],
      default: "new_assignment",
      index: true,
    },
    activeStep: { type: Number, enum: [1, 2, 3, 4], default: 1 },
    declineReason: { type: String, default: null },
    photoProofUrl: { type: String, default: null },
    cashCollected: { type: Number, default: null },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true }, strict: false, minimize: false },
);

deliveryAssignmentSchema.index({ orderId: 1 }, { unique: true });
deliveryAssignmentSchema.index({ agentId: 1, status: 1 });
deliveryAssignmentSchema.index({ pharmacyId: 1, status: 1 });

export const DeliveryAssignment = mongoose.model<IDeliveryAssignment>("DeliveryAssignment", deliveryAssignmentSchema);
