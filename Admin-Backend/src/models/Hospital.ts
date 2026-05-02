import mongoose, { Document, Schema } from "mongoose";

export interface IHospital extends Document {
  name: string;
  address: string;
  phone: string;
  specialties: string[];
  coordinates: { type: "Point"; coordinates: [number, number] };
  isActive: boolean;
  createdAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, index: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    specialties: { type: [String], default: [] },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, strict: false, minimize: false },
);

hospitalSchema.index({ coordinates: "2dsphere" });
hospitalSchema.index({ name: "text" });

export const Hospital = mongoose.model<IHospital>("Hospital", hospitalSchema);
