import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDeliveryEarning extends Document {
  agentId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  earnedAt: Date;
}

const deliveryEarningSchema = new Schema<IDeliveryEarning>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "DeliveryAgent", required: true, index: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: "DeliveryAssignment", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    earnedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false, strict: false, minimize: false },
);

deliveryEarningSchema.index({ agentId: 1, earnedAt: -1 });

export const DeliveryEarning = mongoose.model<IDeliveryEarning>("DeliveryEarning", deliveryEarningSchema);
