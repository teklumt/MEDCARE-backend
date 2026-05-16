import mongoose, { Schema } from 'mongoose';
import { IPrescriptionUpload } from '../types';

const prescriptionUploadSchema = new Schema<IPrescriptionUpload>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf'], required: true },
    verifiedById: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectedReason: { type: String, default: null },
    rejectedById: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

export default mongoose.model<IPrescriptionUpload>('PrescriptionUpload', prescriptionUploadSchema);
