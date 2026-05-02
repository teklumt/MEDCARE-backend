import { Response } from 'express';
import mongoose from 'mongoose';
import Papa from 'papaparse';
import Inventory from '../models/Inventory';
import MasterMedication from '../models/MasterMedication';
import { AuthRequest } from '../middleware/auth';
import { MAX_SEARCH_RESULTS } from '../config/constants';

type InventoryStatusFilter = 'available' | 'low_stock' | 'out_of_stock' | 'expiring_soon';

interface InventoryCsvRow {
  nameEnglish?: string;
  nameAmharic?: string;
  genericName?: string;
  dosageStrength?: string;
  dosageForm?: string;
  category?: string;
  requiresPrescription?: string;
  quantity?: string;
  price?: string;
  expiryDate?: string;
  batchNumber?: string;
  supplierName?: string;
  lowThreshold?: string;
}

const statusAliasToDb: Record<string, InventoryStatusFilter> = {
  in_stock: 'available',
  available: 'available',
  low_stock: 'low_stock',
  out_of_stock: 'out_of_stock',
  expiring_soon: 'expiring_soon'
};

const statusDbToUi: Record<string, 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'available'> = {
  available: 'in_stock',
  low_stock: 'low_stock',
  out_of_stock: 'out_of_stock',
  expiring_soon: 'expiring_soon'
};

function getPharmacyUserId(req: AuthRequest, res: Response): string | null {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return null;
  }

  if (req.user.role !== 'pharmacy') {
    res.status(403).json({ success: false, error: 'Pharmacy access required' });
    return null;
  }

  return req.user.userId;
}

function computeInventoryStatus(quantity: number, lowThreshold: number, expiryDate: Date): InventoryStatusFilter {
  if (quantity <= 0) return 'out_of_stock';

  const now = new Date();
  const thirtyDays = new Date(now);
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  if (expiryDate <= thirtyDays) return 'expiring_soon';
  if (quantity <= lowThreshold) return 'low_stock';

  return 'available';
}

async function resolveMedication(input: {
  medicationName: string;
  medicationNameAmharic?: string;
  dosageStrength?: string;
  dosageForm?: string;
  category?: string;
  requiresPrescription?: boolean;
  genericName?: string;
}) {
  const name = input.medicationName.trim();
  const dosageStrength = input.dosageStrength?.trim();

  const existing = await MasterMedication.findOne({
    nameEnglish: { $regex: `^${name}$`, $options: 'i' },
    ...(dosageStrength ? { dosageStrength } : {})
  });

  if (existing) return existing;

  return MasterMedication.create({
    nameEnglish: name,
    nameAmharic: input.medicationNameAmharic?.trim() || name,
    genericName: input.genericName?.trim(),
    dosageStrength: dosageStrength || undefined,
    dosageForm: input.dosageForm || 'other',
    category: input.category || 'other',
    requiresPrescription: input.requiresPrescription ?? false,
    controlledSubstance: false
  });
}

function serializeInventoryItem(item: any) {
  const medication = item.medicationId && typeof item.medicationId === 'object'
    ? item.medicationId
    : null;

  const dbStatus = item.availability?.status || 'available';

  return {
    id: String(item._id),
    medicationId: medication?._id ? String(medication._id) : String(item.medicationId),
    medication: {
      name: medication?.nameEnglish || 'Unknown medication',
      amharicName: medication?.nameAmharic || ''
    },
    stock: {
      quantity: item.stock?.quantity ?? 0,
      lowThreshold: item.stock?.lowThreshold ?? 10,
      expiryDate: item.stock?.expiryDate
    },
    pricing: {
      price: item.pricing?.sellingPrice ?? 0
    },
    availability: {
      status: dbStatus
    },
    status: statusDbToUi[dbStatus] || 'in_stock'
  };
}

async function buildAlertSummary(pharmacyId: string) {
  const baseQuery = {
    pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
    isDeleted: false
  };

  const [lowStockCount, outOfStockCount] = await Promise.all([
    Inventory.countDocuments({ ...baseQuery, 'availability.status': 'low_stock' }),
    Inventory.countDocuments({ ...baseQuery, 'availability.status': 'out_of_stock' })
  ]);

  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() + 30);

  const expiringSoonCount = await Inventory.countDocuments({
    ...baseQuery,
    'stock.expiryDate': { $lte: threshold }
  });

  return {
    lowStockCount,
    outOfStockCount,
    expiringSoonCount
  };
}

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const pharmacyId = getPharmacyUserId(req, res);
  if (!pharmacyId) return;

  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const statusRaw = typeof req.query.status === 'string' ? req.query.status : '';

    const query: Record<string, unknown> = {
      pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
      isDeleted: false
    };

    const dbStatus = statusAliasToDb[statusRaw];
    if (dbStatus) {
      query['availability.status'] = dbStatus;
    }

    if (search) {
      const meds = await MasterMedication.find({
        $or: [
          { nameEnglish: { $regex: search, $options: 'i' } },
          { nameAmharic: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const medIds = meds.map((m) => m._id);
      query.medicationId = { $in: medIds.length > 0 ? medIds : [new mongoose.Types.ObjectId()] };
    }

    const items = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .populate('medicationId', 'nameEnglish nameAmharic genericName dosageStrength dosageForm category requiresPrescription')
      .lean();

    const summary = await buildAlertSummary(pharmacyId);

    res.json({
      success: true,
      data: {
        items: items.map((item) => serializeInventoryItem(item)),
        alertSummary: summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory',
      details: (error as Error).message
    });
  }
};

export const createInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const pharmacyId = getPharmacyUserId(req, res);
  if (!pharmacyId) return;

  try {
    const {
      medicationName,
      medicationNameAmharic,
      quantity,
      price,
      expiryDate,
      dosageForm,
      category,
      requiresPrescription,
      genericName,
      dosageStrength
    } = req.body as Record<string, unknown>;

    const medName = typeof medicationName === 'string' ? medicationName.trim() : '';
    const qty = Number(quantity);
    const sellingPrice = Number(price);
    const expiry = new Date(String(expiryDate || ''));

    if (!medName) {
      res.status(400).json({ success: false, error: 'medicationName is required' });
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      res.status(400).json({ success: false, error: 'quantity must be a positive integer' });
      return;
    }

    if (!(sellingPrice > 0)) {
      res.status(400).json({ success: false, error: 'price must be a positive number' });
      return;
    }

    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
      res.status(400).json({ success: false, error: 'expiryDate must be a future date' });
      return;
    }

    const medication = await resolveMedication({
      medicationName: medName,
      medicationNameAmharic: typeof medicationNameAmharic === 'string' ? medicationNameAmharic : undefined,
      dosageStrength: typeof dosageStrength === 'string' ? dosageStrength : undefined,
      dosageForm: typeof dosageForm === 'string' ? dosageForm : undefined,
      category: typeof category === 'string' ? category : undefined,
      requiresPrescription: typeof requiresPrescription === 'boolean' ? requiresPrescription : undefined,
      genericName: typeof genericName === 'string' ? genericName : undefined
    });

    const duplicate = await Inventory.findOne({
      pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
      medicationId: medication._id,
      isDeleted: false
    });

    if (duplicate) {
      res.status(409).json({
        success: false,
        error: 'This medication already exists in your inventory',
        data: { existingItemId: duplicate._id }
      });
      return;
    }

    const status = computeInventoryStatus(qty, 10, expiry);

    const created = await Inventory.create({
      pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
      medicationId: medication._id,
      stock: {
        quantity: qty,
        lowThreshold: 10,
        expiryDate: expiry
      },
      pricing: {
        sellingPrice
      },
      availability: {
        status,
        deliveryEligible: true
      },
      version: 1
    });

    const populated = await Inventory.findById(created._id)
      .populate('medicationId', 'nameEnglish nameAmharic genericName dosageStrength dosageForm category requiresPrescription')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Inventory item created',
      data: {
        item: populated ? serializeInventoryItem(populated) : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory item',
      details: (error as Error).message
    });
  }
};

export const updateInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const pharmacyId = getPharmacyUserId(req, res);
  if (!pharmacyId) return;

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, error: 'Invalid inventory item id' });
    return;
  }

  try {
    const item = await Inventory.findOne({
      _id: new mongoose.Types.ObjectId(id),
      pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
      isDeleted: false
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Inventory item not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;

    if (typeof body.quantity !== 'undefined') {
      const qty = Number(body.quantity);
      if (!Number.isInteger(qty) || qty < 0) {
        res.status(400).json({ success: false, error: 'quantity must be a non-negative integer' });
        return;
      }
      item.stock.quantity = qty;
    }

    if (typeof body.price !== 'undefined') {
      const sellingPrice = Number(body.price);
      if (!(sellingPrice > 0)) {
        res.status(400).json({ success: false, error: 'price must be a positive number' });
        return;
      }
      item.pricing.sellingPrice = sellingPrice;
    }

    if (typeof body.expiryDate !== 'undefined') {
      const expiry = new Date(String(body.expiryDate));
      if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
        res.status(400).json({ success: false, error: 'expiryDate must be a future date' });
        return;
      }
      item.stock.expiryDate = expiry;
    }

    if (typeof body.medicationName === 'string' && body.medicationName.trim().length > 0) {
      const medication = await resolveMedication({
        medicationName: body.medicationName,
        medicationNameAmharic: typeof body.medicationNameAmharic === 'string' ? body.medicationNameAmharic : undefined
      });
      item.medicationId = medication._id as mongoose.Types.ObjectId;
    }

    item.version = (item.version || 1) + 1;
    item.availability.status = computeInventoryStatus(
      item.stock.quantity,
      item.stock.lowThreshold || 10,
      item.stock.expiryDate
    );

    await item.save();

    const populated = await Inventory.findById(item._id)
      .populate('medicationId', 'nameEnglish nameAmharic genericName dosageStrength dosageForm category requiresPrescription')
      .lean();

    res.json({
      success: true,
      message: 'Inventory item updated',
      data: {
        item: populated ? serializeInventoryItem(populated) : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory item',
      details: (error as Error).message
    });
  }
};

export const deleteInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const pharmacyId = getPharmacyUserId(req, res);
  if (!pharmacyId) return;

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, error: 'Invalid inventory item id' });
    return;
  }

  try {
    const item = await Inventory.findOne({
      _id: new mongoose.Types.ObjectId(id),
      pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
      isDeleted: false
    });

    if (!item) {
      res.status(404).json({ success: false, error: 'Inventory item not found' });
      return;
    }

    item.isDeleted = true;
    item.deletedAt = new Date();
    await item.save();

    res.json({
      success: true,
      message: 'Inventory item deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete inventory item',
      details: (error as Error).message
    });
  }
};

export const searchMasterMedications = async (req: AuthRequest, res: Response): Promise<void> => {
  const pharmacyId = getPharmacyUserId(req, res);
  if (!pharmacyId) return;

  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';

    if (query.length < 2) {
      res.json({ success: true, data: { items: [] } });
      return;
    }

    const meds = await MasterMedication.find({
      $or: [
        { nameEnglish: { $regex: query, $options: 'i' } },
        { nameAmharic: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ nameEnglish: 1 })
      .limit(MAX_SEARCH_RESULTS)
      .lean();

    res.json({
      success: true,
      data: {
        items: meds.map((m) => ({
          id: String(m._id),
          name: m.nameEnglish,
          amharicName: m.nameAmharic,
          genericName: m.genericName,
          dosageStrength: m.dosageStrength,
          dosageForm: m.dosageForm,
          category: m.category,
          requiresPrescription: m.requiresPrescription
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search medications',
      details: (error as Error).message
    });
  }
};

export const bulkUploadInventoryCsv = async (req: AuthRequest, res: Response): Promise<void> => {
  const pharmacyId = getPharmacyUserId(req, res);
  if (!pharmacyId) return;

  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'CSV file is required' });
      return;
    }

    const csvText = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse<InventoryCsvRow>(csvText, {
      header: true,
      skipEmptyLines: true
    });

    if (parseResult.errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid CSV format',
        details: parseResult.errors[0].message
      });
      return;
    }

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let index = 0; index < parseResult.data.length; index += 1) {
      const row = parseResult.data[index];

      try {
        const medicationName = row.nameEnglish?.trim() || '';
        const medicationNameAmharic = row.nameAmharic?.trim() || medicationName;
        const quantity = Number(row.quantity || 0);
        const price = Number(row.price || 0);
        const expiryDate = new Date(String(row.expiryDate || ''));
        const lowThreshold = Number(row.lowThreshold || 10);

        if (!medicationName) throw new Error('nameEnglish is required');
        if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('quantity must be positive integer');
        if (!(price > 0)) throw new Error('price must be positive');
        if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) throw new Error('expiryDate must be future date');

        const medication = await resolveMedication({
          medicationName,
          medicationNameAmharic,
          genericName: row.genericName,
          dosageStrength: row.dosageStrength,
          dosageForm: row.dosageForm,
          category: row.category,
          requiresPrescription: row.requiresPrescription === 'true'
        });

        const duplicate = await Inventory.findOne({
          pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
          medicationId: medication._id,
          isDeleted: false
        });

        if (duplicate) {
          failed += 1;
          errors.push({
            row: index + 2,
            error: 'Medication already exists in inventory'
          });
          continue;
        }

        const status = computeInventoryStatus(quantity, lowThreshold, expiryDate);

        await Inventory.create({
          pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
          medicationId: medication._id,
          stock: {
            quantity,
            lowThreshold,
            batchNumber: row.batchNumber,
            expiryDate
          },
          pricing: {
            sellingPrice: price
          },
          supplierName: row.supplierName,
          availability: {
            status,
            deliveryEligible: true
          },
          version: 1
        });

        succeeded += 1;
      } catch (rowError) {
        failed += 1;
        errors.push({
          row: index + 2,
          error: (rowError as Error).message
        });
      }
    }

    res.json({
      success: true,
      message: 'CSV processed',
      data: {
        total: parseResult.data.length,
        succeeded,
        failed,
        errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process CSV upload',
      details: (error as Error).message
    });
  }
};
