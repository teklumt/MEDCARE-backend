import { Response } from 'express';
import PrescriptionUpload from '../models/PrescriptionUpload';
import { AuthRequest } from '../middleware/auth';

export const uploadPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { fileUrl, fileType, orderId } = req.body;

    if (!fileUrl || !fileType) {
      res.status(400).json({ success: false, error: 'fileUrl and fileType are required' });
      return;
    }

    const upload = await PrescriptionUpload.create({
      patientId: req.user.userId,
      orderId,
      fileUrl,
      fileType,
      uploadedAt: new Date()
    });

    res.status(201).json({ success: true, message: 'Prescription uploaded', data: upload });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upload prescription', details: (error as Error).message });
  }
};

export const getPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const upload = await PrescriptionUpload.findById(id).lean();

    if (!upload) {
      res.status(404).json({ success: false, error: 'Prescription not found' });
      return;
    }

    res.json({ success: true, data: upload });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch prescription', details: (error as Error).message });
  }
};
