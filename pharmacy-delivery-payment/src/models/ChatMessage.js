const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true },
  senderId: { type: Schema.Types.ObjectId, required: true },
  senderRole: { type: String, enum: ['patient', 'pharmacy'], required: true },
  
  encryptedContent: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String },
  
  deliveryStatus: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'],
    default: 'sent' 
  },
  
  deliveredAt: { type: Date },
  readAt: { type: Date }
}, { timestamps: true });

// Indexes
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ createdAt: 1 }); // for 90-day cleanup

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
