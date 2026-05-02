import mongoose, { Schema } from 'mongoose';
import { IConversation } from '../types';

const conversationSchema = new Schema<IConversation>(
  {
    relatedOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        role: { type: String, enum: ['patient', 'pharmacy'], required: true }
      }
    ],
    lastMessage: {
      content: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date }
    }
  },
  { timestamps: true }
);

conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ updatedAt: -1 });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
