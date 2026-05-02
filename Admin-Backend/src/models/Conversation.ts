import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  relatedOrderId?: Types.ObjectId | null;
  participants: { userId: Types.ObjectId; name: string; role: string }[];
  lastMessage?: { content: string; senderId: Types.ObjectId; sentAt: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    relatedOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    participants: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          name: { type: String, required: true },
          role: { type: String, required: true },
        },
      ],
      default: [],
    },
    lastMessage: {
      content: { type: String },
      senderId: { type: Schema.Types.ObjectId },
      sentAt: { type: Date },
    },
  },
  { timestamps: true, strict: false, minimize: false },
);

conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
