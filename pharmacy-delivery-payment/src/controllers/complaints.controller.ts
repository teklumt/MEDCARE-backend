import { Response } from 'express';
import Complaint from '../models/Complaint';
import { AuthRequest } from '../middleware/auth';

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const complaint = await Complaint.create({
      ...req.body,
      reporterId: req.user.userId
    });

    res.status(201).json({ success: true, message: 'Complaint submitted', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit complaint', details: (error as Error).message });
  }
};

export const getComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).lean();

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint not found' });
      return;
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaint', details: (error as Error).message });
  }
};
