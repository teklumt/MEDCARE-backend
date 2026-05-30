import mongoose, { Schema } from 'mongoose';
import type { INotification } from '../types';

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: ['order', 'complaint'], required: true },
    event: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    entityType: { type: String, enum: ['order', 'complaint'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, readAt: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
