import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const listNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limitRaw = parseInt(String(req.query.limit || '7'), 10) || 7;
    const limit = Math.min(50, Math.max(1, limitRaw));

    const recipientOid = new mongoose.Types.ObjectId(req.user.userId);
    const filter = { recipientId: recipientOid };

    const [notifications, unreadCount, totalCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit + 1)
        .lean(),
      Notification.countDocuments({ ...filter, readAt: null }),
      Notification.countDocuments(filter)
    ]);

    const hasMore = notifications.length > limit;
    const slice = hasMore ? notifications.slice(0, limit) : notifications;

    res.json({
      success: true,
      data: {
        notifications: slice,
        unreadCount,
        page,
        limit,
        hasMore,
        total: totalCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: (error as Error).message
    });
  }
};

export const markNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const recipientOid = new mongoose.Types.ObjectId(req.user.userId);
    const body = req.body as { ids?: unknown; all?: unknown };
    const now = new Date();

    if (body.all === true) {
      await Notification.updateMany({ recipientId: recipientOid, readAt: null }, { $set: { readAt: now } }).exec();
      res.json({ success: true, message: 'All notifications marked read' });
      return;
    }

    const idsRaw = body.ids;
    if (!Array.isArray(idsRaw) || idsRaw.length === 0) {
      res.status(400).json({ success: false, error: 'Provide ids (string[]) or all: true' });
      return;
    }

    const objectIds = idsRaw
      .filter((x): x is string => typeof x === 'string' && mongoose.Types.ObjectId.isValid(x))
      .map((s) => new mongoose.Types.ObjectId(s));

    if (!objectIds.length) {
      res.status(400).json({ success: false, error: 'No valid ids' });
      return;
    }

    await Notification.updateMany(
      {
        recipientId: recipientOid,
        _id: { $in: objectIds },
        readAt: null
      },
      { $set: { readAt: now } }
    ).exec();

    res.json({ success: true, message: 'Notifications updated' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update notifications',
      details: (error as Error).message
    });
  }
};
