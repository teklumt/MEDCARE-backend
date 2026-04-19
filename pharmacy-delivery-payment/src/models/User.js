const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['end_user'], default: 'end_user' },
  region: { type: String },
  city: { type: String },

  status: {
    type: String,
    enum: ['active', 'banned', 'suspended'],
    default: 'active'
  },
  
  ban: {
    isBanned: { type: Boolean, default: false },
    reason: { type: String },
    type: { type: String, enum: ['temporary', 'permanent'] },
    expiresAt: { type: Date },
    bannedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }
  },

  warningCount: { type: Number, default: 0 },
  trustScore: { type: Number, default: 100 },
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String }
}, { timestamps: true });

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ 'ban.isBanned': 1 });

module.exports = mongoose.model('User', userSchema);
