import { Response } from 'express';
import HealthAlert from '../models/HealthAlert';
import { AuthRequest } from '../middleware/auth';

export const getActiveAlert = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await HealthAlert.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch alert', details: (error as Error).message });
  }
};

export const createAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const alert = await HealthAlert.create({
      ...req.body,
      createdById: req.user.userId
    });

    res.status(201).json({ success: true, message: 'Alert created', data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create alert', details: (error as Error).message });
  }
};

export const deactivateAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await HealthAlert.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    res.json({ success: true, message: 'Alert deactivated', data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to deactivate alert', details: (error as Error).message });
  }
};
