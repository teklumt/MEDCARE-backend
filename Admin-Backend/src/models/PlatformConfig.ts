import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPlatformConfig extends Document {
  _id: Types.ObjectId;
  key: string;
  value: string;
}

const platformConfigSchema = new Schema<IPlatformConfig>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true, strict: false, minimize: false },
);

export const PlatformConfig = mongoose.model<IPlatformConfig>("PlatformConfig", platformConfigSchema);
