import { Response } from 'express';
import mongoose from 'mongoose';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { buildComplaintAdminNotificationPayload, notifyMany } from '../services/notification.service';

function generateComplaintRef(): string {
  return `CMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

type CreateBody = {
  issue?: unknown;
  details?: unknown;
  severity?: unknown;
  targetType?: unknown;
  targetId?: unknown;
  targetName?: unknown;
};

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'patient' && req.user.role !== 'pharmacy') {
      res.status(403).json({ success: false, error: 'Only patients and pharmacies may file complaints.' });
      return;
    }

    const body = req.body as CreateBody;
    const issueRaw = body.issue;
    if (typeof issueRaw !== 'string' || !issueRaw.trim()) {
      res.status(400).json({ success: false, error: 'issue is required' });
      return;
    }
    const issue = issueRaw.trim();

    const tt = body.targetType;
    if (tt !== 'pharmacy' && tt !== 'system') {
      res.status(400).json({ success: false, error: 'targetType must be pharmacy or system' });
      return;
    }

    const sev = body.severity;
    const severity: 'low' | 'medium' | 'high' =
      sev === 'medium' || sev === 'high' || sev === 'low' ? sev : 'low';

    const details = typeof body.details === 'string' ? body.details.trim() : undefined;
    const targetName = typeof body.targetName === 'string' ? body.targetName.trim() : undefined;

    let targetId: mongoose.Types.ObjectId | undefined;
    const tid = body.targetId;
    if (tid != null && tid !== '') {
      const s = String(tid);
      if (!mongoose.Types.ObjectId.isValid(s)) {
        res.status(400).json({ success: false, error: 'Invalid targetId' });
        return;
      }
      targetId = new mongoose.Types.ObjectId(s);
    }

    const user = await User.findById(req.user.userId).select('username').lean();
    const reporterName =
      (user?.username && String(user.username).trim()) || req.user.email?.trim() || 'User';

    let ref = generateComplaintRef();
    let complaint = null;
    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        complaint = await Complaint.create({
          ref,
          reporterId: new mongoose.Types.ObjectId(req.user.userId),
          reporterName,
          reporterRole: req.user.role === 'pharmacy' ? 'pharmacy' : 'patient',
          targetType: tt,
          targetId,
          targetName,
          issue,
          details: details || undefined,
          severity,
        });
        break;
      } catch (err) {
        lastErr = err as Error;
        const code = (err as { code?: number }).code;
        if (code === 11000) {
          ref = generateComplaintRef();
          continue;
        }
        throw err;
      }
    }

    if (!complaint) {
      res.status(500).json({
        success: false,
        error: 'Failed to submit complaint',
        details: lastErr?.message ?? 'duplicate ref',
      });
      return;
    }

    try {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
      await notifyMany(
        admins.map((a) => a._id as mongoose.Types.ObjectId),
        buildComplaintAdminNotificationPayload(complaint.toObject()),
      );
    } catch (nErr) {
      console.warn('[notifications] Complaint admin fan-out skipped:', (nErr as Error)?.message);
    }

    res.status(201).json({ success: true, message: 'Complaint submitted', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit complaint', details: (error as Error).message });
  }
};

export const listMyComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'patient' && req.user.role !== 'pharmacy') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const items = await Complaint.find({ reporterId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaints', details: (error as Error).message });
  }
};

export const getComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const complaint = await Complaint.findById(id).lean();

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint not found' });
      return;
    }

    const isOwner = String(complaint.reporterId) === String(req.user.userId);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaint', details: (error as Error).message });
  }
};
