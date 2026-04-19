const mongoose = require('mongoose');
const { Schema } = mongoose;
const { AUDIT_ACTIONS } = require('../config/constants');

const auditLogSchema = new Schema({
  entityType: { 
    type: String, 
    enum: ['inventory', 'order', 'delivery', 'profile', 'payment'],
    required: true 
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy' },
  
  action: { 
    type: String, 
    enum: Object.values(AUDIT_ACTIONS),
    required: true 
  },
  
  performedBy: { type: Schema.Types.ObjectId, required: true },
  performedByRole: { type: String, enum: ['pharmacy', 'driver', 'admin'] },
  
  changes: [{
    field: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Indexes
auditLogSchema.index({ pharmacyId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
