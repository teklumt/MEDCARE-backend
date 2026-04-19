const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSessionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  
  sessionKey: {
    encryptedForPatient: { type: String },
    encryptedForPharmacy: { type: String }
  },
  
  lastMessageAt: { type: Date },
  lastMessagePreview: { type: String },
  
  unreadCount: {
    patient: { type: Number, default: 0 },
    pharmacy: { type: Number, default: 0 }
  },
  
  status: { 
    type: String, 
    enum: ['active', 'closed', 'archived'],
    default: 'active' 
  },
  
  closedAt: { type: Date }
}, { timestamps: true });

// Indexes
chatSessionSchema.index({ patientId: 1, pharmacyId: 1 });
chatSessionSchema.index({ pharmacyId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
