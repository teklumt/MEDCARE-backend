import mongoose, { Document, Schema, Types } from "mongoose";

/** Shared `notifications` collection with pharmacy-delivery-payment (Med API). */

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  category: "order" | "complaint";
  event: string;
  title: string;
  body: string;
  entityType: "order" | "complaint";
  entityId: Types.ObjectId;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: ["order", "complaint"], required: true },
    event: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    entityType: { type: String, enum: ["order", "complaint"], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, readAt: 1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
