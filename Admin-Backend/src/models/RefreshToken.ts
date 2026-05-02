import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRefreshToken extends Document {
  adminId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    isRevoked: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: false, minimize: false },
);

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
