import { Response } from 'express';
import Medication from '../models/Medication';
import Pharmacy from '../models/Pharmacy';
import { AuthRequest } from '../middleware/auth';
import { DEFAULT_PAGE_LIMIT } from '../config/constants';

export const search = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const type = typeof req.query.type === 'string' ? req.query.type : 'medication';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    if (type === 'pharmacy') {
      const query: Record<string, any> = { isActive: true };
      if (q) query.$text = { $search: q };

      const [items, total] = await Promise.all([
        Pharmacy.find(query).skip(skip).limit(limit).lean(),
        Pharmacy.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
      return;
    }

    const medQuery: Record<string, any> = { isActive: true };
    if (q) {
      medQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) medQuery.category = category;

    const [items, total] = await Promise.all([
      Medication.find(medQuery).skip(skip).limit(limit).lean(),
      Medication.countDocuments(medQuery)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed', details: (error as Error).message });
  }
};
