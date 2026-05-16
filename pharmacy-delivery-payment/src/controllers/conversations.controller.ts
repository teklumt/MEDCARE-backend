import { Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import Pharmacy from '../models/Pharmacy';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { DEFAULT_PAGE_LIMIT } from '../config/constants';
import { formatOrderPaymentSeedContent } from '../utils/formatOrderPaymentSeedContent';

const INCREMENTAL_MESSAGE_CAP = 100;

type ParticipantLean = { userId: mongoose.Types.ObjectId | string; name: string; role: string };

function senderRoleForMessage(
  senderId: string,
  participants: ParticipantLean[],
): 'patient' | 'pharmacy' | 'delivery' | undefined {
  for (const p of participants) {
    if (String(p.userId) === senderId) {
      const r = p.role;
      if (r === 'patient' || r === 'pharmacy' || r === 'delivery') return r;
    }
  }
  return undefined;
}

async function participantsMatchOrder(
  participants: ParticipantLean[],
  order: { patientId?: unknown; pharmacyId?: unknown },
): Promise<boolean> {
  const patientPart = participants.find((p) => p.role === 'patient');
  const pharmacyPart = participants.find((p) => p.role === 'pharmacy');
  if (!patientPart || !pharmacyPart) return false;
  if (String(patientPart.userId) !== String(order.patientId ?? '')) return false;

  const orderPharmacyId = order.pharmacyId != null ? String(order.pharmacyId) : '';
  const pharmacyParticipantUserId = String(pharmacyPart.userId ?? '');
  if (!orderPharmacyId || !pharmacyParticipantUserId) return false;

  if (pharmacyParticipantUserId === orderPharmacyId) return true;

  const ownerOwnsOrderPharmacy = await Pharmacy.exists({
    _id: order.pharmacyId,
    ownerId: pharmacyPart.userId,
  });
  return !!ownerOwnsOrderPharmacy;
}

function enrichMessagesWithSenderRole(
  items: Record<string, unknown>[],
  participants: ParticipantLean[],
): Array<Record<string, unknown> & { senderRole?: 'patient' | 'pharmacy' | 'delivery' | 'system' }> {
  return items.map((m) => {
    if (m.kind === 'system') {
      return { ...m, senderRole: 'system' as const };
    }
    const sid = String(m.senderId ?? '');
    const sr = senderRoleForMessage(sid, participants);
    return { ...m, senderRole: sr };
  });
}

async function getPharmacyIdForOwner(ownerUserId: string): Promise<string | null> {
  const pharmacy = await Pharmacy.findOne({ ownerId: ownerUserId }).select('_id').lean();
  return pharmacy ? String(pharmacy._id) : null;
}

async function assertConversationParticipant(
  conversation: { participants: ParticipantLean[] } | null,
  req: AuthRequest,
  res: Response,
): Promise<boolean> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return false;
  }
  if (!conversation || !conversation.participants?.length) {
    res.status(404).json({ success: false, error: 'Conversation not found' });
    return false;
  }

  const partIds = conversation.participants.map((p) => String(p.userId));
  const uid = String(req.user.userId);

  if (partIds.includes(uid)) {
    return true;
  }

  if (req.user.role === 'pharmacy') {
    const phId = await getPharmacyIdForOwner(uid);
    if (phId && partIds.includes(phId)) {
      return true;
    }
  }

  res.status(403).json({ success: false, error: 'Forbidden' });
  return false;
}

export const listConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    let query: Record<string, unknown>;

    if (req.user.role === 'pharmacy') {
      const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId }).select('_id').lean();
      if (pharmacy?._id) {
        query = {
          $or: [{ 'participants.userId': req.user.userId }, { 'participants.userId': pharmacy._id }],
        };
      } else {
        query = { 'participants.userId': req.user.userId };
      }
    } else if (req.user.role === 'delivery') {
      query = { 'participants.userId': req.user.userId };
    } else {
      query = { 'participants.userId': req.user.userId };
    }

    const conversations = await Conversation.find(query).sort({ updatedAt: -1 }).lean();

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch conversations', details: (error as Error).message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { participantId, orderId } = req.body;
    if (!participantId) {
      res.status(400).json({ success: false, error: 'participantId is required' });
      return;
    }

    const existing = await Conversation.findOne({
      relatedOrderId: orderId || null,
      'participants.userId': { $all: [req.user.userId, participantId] },
    }).lean();

    if (existing) {
      res.json({ success: true, data: existing });
      return;
    }

    const requester = await User.findById(req.user.userId).lean();
    const pharmacy = await Pharmacy.findById(participantId).lean();
    const patient = await User.findById(participantId).lean();

    if (!requester || (!pharmacy && !patient)) {
      res.status(404).json({ success: false, error: 'Participant not found' });
      return;
    }

    const targetRole = pharmacy ? 'pharmacy' : 'patient';
    const targetName = pharmacy ? pharmacy.businessName : patient?.username || 'User';

    const conversation = await Conversation.create({
      relatedOrderId: orderId || null,
      participants: [
        { userId: req.user.userId, name: requester.username, role: req.user.role },
        { userId: participantId, name: targetName, role: targetRole },
      ],
    });

    const convId = conversation._id;

    if (orderId) {
      try {
        const order = await Order.findById(orderId).lean();
        if (order && (await participantsMatchOrder(conversation.participants as ParticipantLean[], order))) {
          const count = await Message.countDocuments({ conversationId: convId });
          if (count === 0) {
            const content = formatOrderPaymentSeedContent({
              totalAmount: order.totalAmount,
              paymentMethod: order.paymentMethod as string | undefined,
              paymentStatus: order.paymentStatus as string | undefined,
            });
            const now = new Date();
            await Message.create({
              conversationId: convId,
              senderId: order.patientId as mongoose.Types.ObjectId,
              senderName: 'MedCare',
              content,
              kind: 'system',
              sentAt: now,
              isRead: false,
            });
            conversation.lastMessage = {
              content,
              senderId: new mongoose.Types.ObjectId(String(order.patientId)),
              sentAt: now,
            };
            await conversation.save();
          }
        }
      } catch (seedErr) {
        console.error('[conversations] payment seed skipped:', seedErr);
      }
    }

    const persisted = await Conversation.findById(convId).lean();

    res.status(201).json({ success: true, message: 'Conversation created', data: persisted ?? conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create conversation', details: (error as Error).message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const conversation = await Conversation.findById(id).lean();

    const ok = await assertConversationParticipant(conversation, req, res);
    if (!ok) return;

    const convParticipants = conversation!.participants;

    const sinceRaw = typeof req.query.since === 'string' ? req.query.since.trim() : '';
    if (sinceRaw.length > 0) {
      const sinceDate = new Date(sinceRaw);
      if (Number.isNaN(sinceDate.getTime())) {
        res.status(400).json({ success: false, error: 'Invalid since datetime' });
        return;
      }

      const rawItems = await Message.find({
        conversationId: id,
        sentAt: { $gt: sinceDate },
      })
        .sort({ sentAt: 1 })
        .limit(INCREMENTAL_MESSAGE_CAP)
        .lean();

      const items = enrichMessagesWithSenderRole(rawItems as Record<string, unknown>[], convParticipants);

      res.json({
        success: true,
        data: items,
        incremental: true,
      });
      return;
    }

    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      Message.find({ conversationId: id }).sort({ sentAt: -1 }).skip(skip).limit(limit).lean(),
      Message.countDocuments({ conversationId: id }),
    ]);

    const itemsDesc = enrichMessagesWithSenderRole(rawItems as Record<string, unknown>[], convParticipants);

    res.json({
      success: true,
      data: itemsDesc,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages', details: (error as Error).message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ success: false, error: 'content is required' });
      return;
    }

    const conversation = await Conversation.findById(id);

    const ok = await assertConversationParticipant(conversation, req, res);
    if (!ok) return;

    const sender = await User.findById(req.user.userId).lean();
    if (!sender) {
      res.status(404).json({ success: false, error: 'Sender not found' });
      return;
    }

    const message = await Message.create({
      conversationId: id,
      senderId: req.user.userId,
      senderName: sender.username,
      content,
      sentAt: new Date(),
    });

    conversation!.lastMessage = {
      content,
      senderId: new mongoose.Types.ObjectId(req.user.userId),
      sentAt: new Date(),
    };
    await conversation!.save();

    const plain = message.toObject() as unknown as Record<string, unknown>;
    const kind = plain.kind === 'system' ? 'system' : 'user';
    const senderRole =
      kind === 'system'
        ? ('system' as const)
        : senderRoleForMessage(String(plain.senderId), conversation!.participants as ParticipantLean[]);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { ...plain, kind, senderRole },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message', details: (error as Error).message });
  }
};

export const markConversationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const conversation = await Conversation.findById(id).lean();

    const ok = await assertConversationParticipant(conversation, req, res);
    if (!ok) return;

    await Message.updateMany(
      { conversationId: id, senderId: { $ne: req.user.userId }, isRead: false },
      { isRead: true },
    );

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark conversation read', details: (error as Error).message });
  }
};
