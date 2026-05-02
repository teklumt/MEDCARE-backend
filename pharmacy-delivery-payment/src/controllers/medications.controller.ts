import { Response } from 'express';
import Medication from '../models/Medication';
import { AuthRequest } from '../middleware/auth';

export const getMedicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const medication = await Medication.findById(id).lean();

    if (!medication) {
      res.status(404).json({ success: false, error: 'Medication not found' });
      return;
    }

    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch medication', details: (error as Error).message });
  }
};
