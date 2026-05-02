import { Response } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import Pharmacy from '../models/Pharmacy';
import { AuthRequest } from '../middleware/auth';
import { DEFAULT_PAGE_LIMIT } from '../config/constants';

export const listConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const conversations = await Conversation.find({ 'participants.userId': req.user.userId })
      .sort({ updatedAt: -1 })
      .lean();

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
      'participants.userId': { $all: [req.user.userId, participantId] }
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
        { userId: participantId, name: targetName, role: targetRole }
      ]
    });

    res.status(201).json({ success: true, message: 'Conversation created', data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create conversation', details: (error as Error).message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Message.find({ conversationId: id }).sort({ sentAt: -1 }).skip(skip).limit(limit).lean(),
      Message.countDocuments({ conversationId: id })
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
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
    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

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
      sentAt: new Date()
    });

    conversation.lastMessage = {
      content,
      senderId: new mongoose.Types.ObjectId(req.user.userId),
      sentAt: new Date()
    };
    await conversation.save();

    res.status(201).json({ success: true, message: 'Message sent', data: message });
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

    await Message.updateMany(
      { conversationId: id, senderId: { $ne: req.user.userId }, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark conversation read', details: (error as Error).message });
  }
};
