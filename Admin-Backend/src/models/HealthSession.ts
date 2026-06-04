import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

const healthSessionSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    language: { type: String, enum: ["en", "am"], default: "en" },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true },
);

export const HealthSession = mongoose.model("HealthSession", healthSessionSchema);
