import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Order from '../models/Order';
import Pharmacy from '../models/Pharmacy';
import User from '../models/User';

/**
 * Ensures a pharmacy–driver conversation exists for a dispatched delivery order,
 * seeds a system intro when the thread is empty, and updates the driver participant on reassignment.
 */
export async function ensurePharmacyDriverConversation(orderId: mongoose.Types.ObjectId | string): Promise<void> {
  const order = await Order.findById(orderId).lean();
  if (!order || order.deliveryMethod !== 'delivery' || order.status !== 'dispatched' || !order.deliveryAgentId) {
    return;
  }

  const pharmacy = await Pharmacy.findById(order.pharmacyId).lean();
  if (!pharmacy) return;

  const deliveryAgentId = new mongoose.Types.ObjectId(String(order.deliveryAgentId));
  const driver = await User.findById(deliveryAgentId).lean();
  const driverName = driver?.username?.trim() || 'Driver';

  const orderRef = String(order._id).slice(-8).toUpperCase();
  const seedContent = `Order assigned for delivery. Reference: ${orderRef}. Chat with your pharmacy here.`;

  const existing = await Conversation.findOne({ relatedOrderId: order._id });

  if (existing) {
    const parts = existing.participants as Array<{
      userId: mongoose.Types.ObjectId;
      name: string;
      role: string;
    }>;
    const deliveryIdx = parts.findIndex((p) => p.role === 'delivery');
    const currentDriverId = deliveryIdx >= 0 ? String(parts[deliveryIdx].userId) : '';

    if (currentDriverId !== String(deliveryAgentId)) {
      if (deliveryIdx >= 0) {
        parts[deliveryIdx] = {
          userId: deliveryAgentId,
          name: driverName,
          role: 'delivery',
        };
      } else {
        parts.push({
          userId: deliveryAgentId,
          name: driverName,
          role: 'delivery',
        });
      }
      existing.participants = parts as typeof existing.participants;
      await existing.save();

      await Message.create({
        conversationId: existing._id,
        senderId: pharmacy.ownerId as mongoose.Types.ObjectId,
        senderName: 'MedCare',
        content: 'Delivery driver was updated for this order.',
        kind: 'system',
        sentAt: new Date(),
        isRead: false,
      });

      const last = await Message.findOne({ conversationId: existing._id }).sort({ sentAt: -1 }).lean();
      if (last) {
        existing.lastMessage = {
          content: String(last.content),
          senderId: last.senderId as mongoose.Types.ObjectId,
          sentAt: last.sentAt,
        };
        await existing.save();
      }
    }

    const msgCount = await Message.countDocuments({ conversationId: existing._id });
    if (msgCount === 0) {
      const now = new Date();
      await Message.create({
        conversationId: existing._id,
        senderId: pharmacy.ownerId as mongoose.Types.ObjectId,
        senderName: 'MedCare',
        content: seedContent,
        kind: 'system',
        sentAt: now,
        isRead: false,
      });
      existing.lastMessage = {
        content: seedContent,
        senderId: new mongoose.Types.ObjectId(String(pharmacy.ownerId)),
        sentAt: now,
      };
      await existing.save();
    }
    return;
  }

  const conv = await Conversation.create({
    relatedOrderId: order._id,
    participants: [
      {
        userId: pharmacy._id as mongoose.Types.ObjectId,
        name: pharmacy.businessName,
        role: 'pharmacy',
      },
      {
        userId: deliveryAgentId,
        name: driverName,
        role: 'delivery',
      },
    ],
  });

  const now = new Date();
  await Message.create({
    conversationId: conv._id,
    senderId: pharmacy.ownerId as mongoose.Types.ObjectId,
    senderName: 'MedCare',
    content: seedContent,
    kind: 'system',
    sentAt: now,
    isRead: false,
  });
  conv.lastMessage = {
    content: seedContent,
    senderId: new mongoose.Types.ObjectId(String(pharmacy.ownerId)),
    sentAt: now,
  };
  await conv.save();
}
