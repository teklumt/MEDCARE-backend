import mongoose, { Schema } from 'mongoose';

/**
 * Mirrors Admin-Backend DeliveryAgent / `deliveryagents` collection.
 * _id is the same as the delivery User _id; pharmacyId is the employer pharmacy.
 */
const deliveryAgentSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    vehicleType: { type: String },
    licensePlate: { type: String },
    nationalId: { type: String },
    isOnline: { type: Boolean, default: false },
    stats: { type: Schema.Types.Mixed }
  },
  { timestamps: true, strict: false, collection: 'deliveryagents' }
);

export default mongoose.model('DeliveryAgent', deliveryAgentSchema);
