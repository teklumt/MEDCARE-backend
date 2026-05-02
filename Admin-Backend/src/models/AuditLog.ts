import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  adminId?: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false, strict: false, minimize: false },
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
