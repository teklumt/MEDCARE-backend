import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOtp extends Document {
  userId: Types.ObjectId;
  codeHash: string;
  purpose: "password_reset" | "phone_verify";
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["password_reset", "phone_verify"], required: true },
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, strict: false, minimize: false },
);

otpSchema.index({ userId: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);
