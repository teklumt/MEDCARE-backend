import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDriver extends Document {
  pharmacyId: Types.ObjectId;
  vehicleType: "bicycle" | "motorcycle" | "car";
  isOnline: boolean;
  stats: {
    totalDelivered: number;
    earnings: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    _id: { type: Schema.Types.ObjectId, ref: "User" },
    pharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true, index: true },
    vehicleType: { type: String, enum: ["bicycle", "motorcycle", "car"], required: true },
    isOnline: { type: Boolean, default: false },
    stats: {
      totalDelivered: { type: Number, default: 0 },
      earnings: {
        today: { type: Number, default: 0 },
        thisWeek: { type: Number, default: 0 },
        thisMonth: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true, strict: false, minimize: false },
);

export const Driver = mongoose.model<IDriver>("DeliveryAgent", driverSchema);
