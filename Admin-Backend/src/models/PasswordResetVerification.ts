import mongoose, { Document, Schema } from "mongoose";

/** One pending password-reset OTP per email (SMTP), same TTL/attempt rules as signup verification. */
export interface IPasswordResetVerification extends Document {
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const schema = new Schema<IPasswordResetVerification>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true, unique: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, strict: false, minimize: false },
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetVerification = mongoose.model<IPasswordResetVerification>(
  "PasswordResetVerification",
  schema,
);
