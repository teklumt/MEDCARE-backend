import { Response } from 'express';
import Hospital from '../models/Hospital';
import { AuthRequest } from '../middleware/auth';
import { DEFAULT_PAGE_LIMIT } from '../config/constants';

export const listHospitals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const lat = typeof req.query.lat === 'string' ? Number(req.query.lat) : null;
    const lng = typeof req.query.lng === 'string' ? Number(req.query.lng) : null;
    const limit = DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { isActive: true };
    if (lat !== null && lng !== null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      query.coordinates = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] }
        }
      };
    }

    const [items, total] = await Promise.all([
      Hospital.find(query).skip(skip).limit(limit).lean(),
      Hospital.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch hospitals', details: (error as Error).message });
  }
};

export const getHospitalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findById(id).lean();

    if (!hospital) {
      res.status(404).json({ success: false, error: 'Hospital not found' });
      return;
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch hospital', details: (error as Error).message });
  }
};
