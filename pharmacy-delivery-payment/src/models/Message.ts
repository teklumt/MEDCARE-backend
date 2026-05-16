import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
    kind: { type: String, enum: ['user', 'system'], default: 'user' }
  },
  { timestamps: false }
);

messageSchema.index({ conversationId: 1, sentAt: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
