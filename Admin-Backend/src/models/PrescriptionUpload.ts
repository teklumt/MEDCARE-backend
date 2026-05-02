import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPrescriptionUpload extends Document {
  patientId: Types.ObjectId;
  orderId: Types.ObjectId;
  fileUrl: string;
  fileType: "image" | "pdf";
  verifiedById?: Types.ObjectId | null;
  verifiedAt?: Date | null;
  uploadedAt: Date;
}

const prescriptionUploadSchema = new Schema<IPrescriptionUpload>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ["image", "pdf"], required: true },
    verifiedById: { type: Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: false, strict: false, minimize: false },
);

export const PrescriptionUpload = mongoose.model<IPrescriptionUpload>("PrescriptionUpload", prescriptionUploadSchema);
