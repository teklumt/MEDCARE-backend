import mongoose, { Document, Schema, Types } from "mongoose";

/** Aligned with Med API `Complaint`; optional `ref` for legacy docs. Same DB (`pharmacy-system`) recommended. */
export interface IComplaint extends Document {
  ref?: string;
  reporterId: Types.ObjectId;
  reporterName?: string;
  /** Set by Med API when filing from patient or pharmacy portals */
  reporterRole?: "patient" | "pharmacy";
  targetType: "pharmacy" | "delivery_agent" | "system" | "doctor";
  targetId?: Types.ObjectId;
  targetName?: string;
  issue: string;
  details?: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved" | "dismissed";
  resolvedById?: Types.ObjectId | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    ref: { type: String, required: false, index: true, sparse: true },
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reporterName: { type: String },
    reporterRole: { type: String, enum: ["patient", "pharmacy"], index: true },
    targetType: { type: String, enum: ["pharmacy", "delivery_agent", "system", "doctor"], required: true },
    targetId: { type: Schema.Types.ObjectId },
    targetName: { type: String },
    issue: { type: String, required: true },
    details: { type: String },
    severity: { type: String, enum: ["low", "medium", "high"], default: "low", index: true },
    status: { type: String, enum: ["open", "resolved", "dismissed"], default: "open", index: true },
    resolvedById: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
    resolution: { type: String, default: null },
  },
  { timestamps: true, strict: false, minimize: false },
);

complaintSchema.index({ status: 1, severity: -1 });
complaintSchema.index({ reporterId: 1, createdAt: -1 });
complaintSchema.index({ createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>("Complaint", complaintSchema);
