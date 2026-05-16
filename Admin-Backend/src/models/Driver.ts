import mongoose, { Document, Schema, Types } from "mongoose";

/** Stored vehicle types; UI labels mapped in registration.service */
export type DriverVehicleType =
  | "bicycle"
  | "motorcycle"
  | "car"
  | "on_foot"
  | "three_wheeler";

export interface IDriver extends Document {
  pharmacyId: Types.ObjectId;
  vehicleType: DriverVehicleType;
  nationalId?: string;
  licensePlate?: string;
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
    vehicleType: {
      type: String,
      enum: ["bicycle", "motorcycle", "car", "on_foot", "three_wheeler"],
      required: true,
    },
    nationalId: { type: String },
    licensePlate: { type: String },
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
