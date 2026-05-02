import mongoose, { Schema } from 'mongoose';
import { IComplaint } from '../types';

const complaintSchema = new Schema<IComplaint>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String },
    targetType: { type: String, enum: ['pharmacy', 'system'], required: true },
    targetId: { type: Schema.Types.ObjectId },
    targetName: { type: String },
    issue: { type: String, required: true },
    details: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
    resolvedById: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    resolution: { type: String, default: null }
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, severity: -1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model<IComplaint>('Complaint', complaintSchema);
