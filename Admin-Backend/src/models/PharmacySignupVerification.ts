import mongoose, { Document, Schema } from "mongoose";

/** Shared collection for email OTP during signup (pharmacy, patient, delivery). */
export type SignupVerificationPurpose =
  | "pharmacy_register"
  | "patient_register"
  | "delivery_register";

export interface IPharmacySignupVerification extends Document {
  email: string;
  purpose: SignupVerificationPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const pharmacySignupVerificationSchema = new Schema<IPharmacySignupVerification>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: {
      type: String,
      required: true,
      enum: ["pharmacy_register", "patient_register", "delivery_register"],
      default: "pharmacy_register",
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, strict: false, minimize: false },
);

pharmacySignupVerificationSchema.index({ email: 1, purpose: 1 }, { unique: true });
pharmacySignupVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PharmacySignupVerification = mongoose.model<IPharmacySignupVerification>(
  "PharmacySignupVerification",
  pharmacySignupVerificationSchema,
);
