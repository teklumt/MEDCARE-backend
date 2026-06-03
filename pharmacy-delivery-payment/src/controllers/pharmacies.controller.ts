import { Response } from "express";
import mongoose, { Types } from "mongoose";
import Papa from "papaparse";
import DeliveryAgent from "../models/DeliveryAgent";
import Pharmacy from "../models/Pharmacy";
import Medication from "../models/Medication";
import Review from "../models/Review";
import PrescriptionUpload from "../models/PrescriptionUpload";
import Order from "../models/Order";
import { AuthRequest } from "../middleware/auth";
import { DEFAULT_PAGE_LIMIT } from "../config/constants";
import { parseCoordinatesInput } from "../utils/geo";
import { getMedicationImageFileUrl } from "../config/upload";

const computeStockStatus = (quantity: number, lowThreshold: number) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= lowThreshold) return "low_stock";
  return "adequate";
};

export const listPharmacies = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const lat =
      typeof req.query.lat === "string" ? Number(req.query.lat) : null;
    const lng =
      typeof req.query.lng === "string" ? Number(req.query.lng) : null;

    const query: Record<string, any> = { isActive: true };
    if (search) {
      query.$text = { $search: search };
    }

    if (
      lat !== null &&
      lng !== null &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng)
    ) {
      query.coordinates = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      };
    }

    const pharmacies = await Pharmacy.find(query).lean();

    res.json({ success: true, data: pharmacies });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch pharmacies",
        details: (error as Error).message,
      });
  }
};

export const getPharmacyById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const pharmacy = await Pharmacy.findById(id).lean();

    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    res.json({ success: true, data: pharmacy });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch pharmacy",
        details: (error as Error).message,
      });
  }
};

export const getPharmacyInventory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category =
      typeof req.query.category === "string" ? req.query.category.trim() : "";
    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const query: Record<string, any> = { pharmacyId: id, isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;

    const limit = DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Medication.find(query).skip(skip).limit(limit).lean(),
      Medication.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch inventory",
        details: (error as Error).message,
      });
  }
};

export const getPharmacyReviews = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid pharmacy id" });
      return;
    }

    const pharmacyObjectId = new mongoose.Types.ObjectId(id);

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit = DEFAULT_PAGE_LIMIT;
    const skip = (page - 1) * limit;

    const filter = {
      pharmacyId: pharmacyObjectId,
    };

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch reviews",
        details: (error as Error).message,
      });
  }
};

const COMMENT_MAX = 2000;
const PATIENT_NAME_MAX = 120;

function isMongoDuplicateKey(err: unknown): boolean {
  const code =
    typeof err === "object" && err !== null
      ? (err as { code?: number | string }).code
      : undefined;
  return code === 11000 || code === "11000";
}

async function syncPharmacyReviewStats(pharmacyId: string): Promise<void> {
  const oid = new mongoose.Types.ObjectId(pharmacyId);
  const agg = await Review.aggregate([
    { $match: { pharmacyId: oid } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);
  const row = agg[0];
  const avg =
    row?.avgRating != null ? Math.round(Number(row.avgRating) * 100) / 100 : 0;
  const count = row?.count ?? 0;
  await Pharmacy.findByIdAndUpdate(pharmacyId, {
    $set: { "stats.rating": avg, "stats.reviewCount": count },
  });
}

export const addPharmacyReview = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid pharmacy id" });
      return;
    }

    const pharmacyExists = await Pharmacy.exists({ _id: id });
    if (!pharmacyExists) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const {
      rating: ratingRaw,
      comment: commentRaw,
      patientName: patientNameRaw,
    } = req.body ?? {};
    const r = Number(ratingRaw);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      res
        .status(400)
        .json({ success: false, error: "rating must be a number from 1 to 5" });
      return;
    }

    let comment: string | undefined;
    if (commentRaw != null && String(commentRaw).trim() !== "") {
      comment = String(commentRaw).trim().slice(0, COMMENT_MAX);
    }

    let patientName: string | undefined;
    if (patientNameRaw != null && String(patientNameRaw).trim() !== "") {
      patientName = String(patientNameRaw).trim().slice(0, PATIENT_NAME_MAX);
    }

    let review;
    try {
      review = await Review.create({
        pharmacyId: id,
        patientId: req.user.userId,
        patientName,
        rating: r,
        comment,
      });
    } catch (err) {
      if (isMongoDuplicateKey(err)) {
        res
          .status(409)
          .json({
            success: false,
            error: "Already reviewed",
            details: "You already submitted a review for this pharmacy.",
          });
        return;
      }
      throw err;
    }

    await syncPharmacyReviewStats(id);

    res
      .status(201)
      .json({ success: true, message: "Review submitted", data: review });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to submit review",
        details: (error as Error).message,
      });
  }
};

export const getMyPharmacy = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();

    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    res.json({ success: true, data: pharmacy });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch pharmacy profile",
        details: (error as Error).message,
      });
  }
};

/** Delivery users for assign-to-driver UI: scoped via deliveryagents, hydrated from users. */
export const getMyDeliveryAgents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const agents = await DeliveryAgent.find({ pharmacyId: pharmacy._id })
      .sort({ createdAt: 1 })
      .lean();
    const ids = agents.map((a) => a._id).filter(Boolean) as Types.ObjectId[];
    if (ids.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    const usersCol = mongoose.connection.db!.collection("users");
    const userDocs = (await usersCol
      .find({ _id: { $in: ids }, role: "delivery" })
      .project({ username: 1, phone: 1, email: 1 })
      .toArray()) as {
      _id: Types.ObjectId;
      username?: string;
      phone?: string;
      email?: string;
    }[];

    const userById = new Map(userDocs.map((u) => [String(u._id), u] as const));

    const data = agents.map((a) => {
      const u = userById.get(String(a._id));
      return {
        id: String(a._id),
        username: u?.username,
        phone: u?.phone,
        email: u?.email,
        vehicleType: (a as { vehicleType?: string }).vehicleType,
        licensePlate: (a as { licensePlate?: string }).licensePlate,
        isOnline: Boolean((a as { isOnline?: boolean }).isOnline),
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch delivery agents",
        details: (error as Error).message,
      });
  }
};

export const updateMyPharmacy = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const update: Record<string, unknown> = {};

    if (typeof req.body?.location === "string") {
      update.location = req.body.location.trim();
    }
    if (typeof req.body?.address === "string") {
      update.address = req.body.address.trim();
    }
    if (typeof req.body?.openingHours === "string") {
      update.openingHours = req.body.openingHours;
    }
    if (typeof req.body?.isOpen === "boolean") {
      update.isOpen = req.body.isOpen;
    }

    const coords = parseCoordinatesInput(req.body?.coordinates);
    if (req.body?.coordinates != null) {
      if (!coords) {
        res.status(400).json({
          success: false,
          error: "Invalid coordinates. Provide a valid map pin (not 0,0).",
        });
        return;
      }
      update.coordinates = coords;
    }

    if (
      typeof req.body?.deliveryRadiusKm === "number" &&
      Number.isFinite(req.body.deliveryRadiusKm)
    ) {
      const km = req.body.deliveryRadiusKm;
      if (km < 1 || km > 50) {
        res.status(400).json({
          success: false,
          error: "deliveryRadiusKm must be between 1 and 50",
        });
        return;
      }
      update.deliveryRadiusKm = km;
    }

    if (
      typeof req.body?.deliveryFee === "number" &&
      Number.isFinite(req.body.deliveryFee)
    ) {
      const fee = req.body.deliveryFee;
      if (fee < 0) {
        res
          .status(400)
          .json({ success: false, error: "deliveryFee cannot be negative" });
        return;
      }
      update.deliveryFee = fee;
    }

    if (typeof req.body?.deliveryAvailable === "boolean") {
      update.deliveryAvailable = req.body.deliveryAvailable;
    }

    if (Object.keys(update).length === 0) {
      res
        .status(400)
        .json({ success: false, error: "No valid fields to update" });
      return;
    }

    const pharmacy = await Pharmacy.findOneAndUpdate(
      { ownerId: req.user.userId },
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    res.json({ success: true, message: "Pharmacy updated", data: pharmacy });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update pharmacy profile",
        details: (error as Error).message,
      });
  }
};

export const getMyPharmacyInventory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category =
      typeof req.query.category === "string" ? req.query.category.trim() : "";

    const query: Record<string, any> = {
      pharmacyId: pharmacy._id,
      isActive: true,
    };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;

    const items = await Medication.find(query).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: items });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch inventory",
        details: (error as Error).message,
      });
  }
};

export const createMedication = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const payload = req.body || {};
    const stockQuantity = Number(payload.stockQuantity || 0);
    const lowStockThreshold = Number(payload.lowStockThreshold || 10);
    const stockStatus = computeStockStatus(stockQuantity, lowStockThreshold);

    const created = await Medication.create({
      ...payload,
      pharmacyId: pharmacy._id,
      stockQuantity,
      lowStockThreshold,
      stockStatus,
    });

    res
      .status(201)
      .json({ success: true, message: "Medication created", data: created });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to create medication",
        details: (error as Error).message,
      });
  }
};

export const uploadMedicationImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({
          success: false,
          error: "Image file is required (field name: file).",
        });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const imageUrl = getMedicationImageFileUrl(req.file);

    res.json({
      success: true,
      message: "Medication image uploaded",
      data: { imageUrl },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to upload medication image",
      details: (error as Error).message,
    });
  }
};

export const bulkUploadMedications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: "CSV file is required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const csvText = req.file.buffer.toString("utf-8");
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      res
        .status(400)
        .json({
          success: false,
          error: "Invalid CSV format",
          details: parseResult.errors[0].message,
        });
      return;
    }

    let succeeded = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let index = 0; index < parseResult.data.length; index += 1) {
      const row = parseResult.data[index];

      try {
        const name = row.name?.trim();
        const stockQuantity = Number(row.stockQuantity || 0);
        const lowStockThreshold = Number(row.lowStockThreshold || 10);
        const price = Number(row.price || 0);
        const expiryDate = new Date(String(row.expiryDate || ""));

        if (!name) throw new Error("name is required");
        if (!Number.isFinite(stockQuantity) || stockQuantity < 0)
          throw new Error("stockQuantity must be >= 0");
        if (!(price > 0)) throw new Error("price must be positive");
        if (Number.isNaN(expiryDate.getTime()))
          throw new Error("expiryDate must be valid");

        const stockStatus = computeStockStatus(
          stockQuantity,
          lowStockThreshold,
        );

        await Medication.create({
          pharmacyId: pharmacy._id,
          name,
          genericName: row.genericName,
          category: row.category,
          dosageForm: row.dosageForm,
          strength: row.strength,
          manufacturer: row.manufacturer,
          batchNumber: row.batchNumber,
          expiryDate,
          price,
          stockQuantity,
          lowStockThreshold,
          stockStatus,
          requiresPrescription: row.requiresPrescription === "true",
          imageUrl: row.imageUrl,
          description: row.description,
          isActive: true,
        });

        succeeded += 1;
      } catch (rowError) {
        failed += 1;
        errors.push({ row: index + 2, error: (rowError as Error).message });
      }
    }

    res.json({
      success: true,
      message: "CSV processed",
      data: { total: parseResult.data.length, succeeded, failed, errors },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to process CSV upload",
        details: (error as Error).message,
      });
  }
};

export const updateMedication = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: "Invalid medication id" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const existing = await Medication.findOne({
      _id: id,
      pharmacyId: pharmacy._id,
    });
    if (!existing) {
      res.status(404).json({ success: false, error: "Medication not found" });
      return;
    }

    Object.assign(existing, req.body);

    const stockQuantity =
      typeof req.body.stockQuantity !== "undefined"
        ? Number(req.body.stockQuantity)
        : existing.stockQuantity;

    const lowStockThreshold =
      typeof req.body.lowStockThreshold !== "undefined"
        ? Number(req.body.lowStockThreshold)
        : existing.lowStockThreshold;

    existing.stockStatus = computeStockStatus(stockQuantity, lowStockThreshold);
    existing.stockQuantity = stockQuantity;
    existing.lowStockThreshold = lowStockThreshold;

    await existing.save();

    res.json({ success: true, message: "Medication updated", data: existing });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update medication",
        details: (error as Error).message,
      });
  }
};

export const deleteMedication = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const { id } = req.params;

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const deleted = await Medication.findOneAndUpdate(
      { _id: id, pharmacyId: pharmacy._id },
      { isActive: false },
      { new: true },
    );

    if (!deleted) {
      res.status(404).json({ success: false, error: "Medication not found" });
      return;
    }

    res.json({ success: true, message: "Medication removed" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to delete medication",
        details: (error as Error).message,
      });
  }
};

export const getInventoryAlerts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const [lowStockCount, outOfStockCount] = await Promise.all([
      Medication.countDocuments({
        pharmacyId: pharmacy._id,
        stockStatus: "low_stock",
        isActive: true,
      }),
      Medication.countDocuments({
        pharmacyId: pharmacy._id,
        stockStatus: "out_of_stock",
        isActive: true,
      }),
    ]);

    res.json({
      success: true,
      data: { lowStockCount, outOfStockCount },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch alerts",
        details: (error as Error).message,
      });
  }
};

export const getPharmacyAnalytics = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const period =
      typeof req.query.period === "string" ? req.query.period : "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - days);
    const prevSince = new Date(now);
    prevSince.setDate(prevSince.getDate() - days * 2);

    const [orderCount, revenueAgg, prevOrderCount, prevRevenueAgg] = await Promise.all([
      Order.countDocuments({ pharmacyId: pharmacy._id, createdAt: { $gte: since } }),
      Order.aggregate([
        { $match: { pharmacyId: pharmacy._id, createdAt: { $gte: since } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ pharmacyId: pharmacy._id, createdAt: { $gte: prevSince, $lt: since } }),
      Order.aggregate([
        { $match: { pharmacyId: pharmacy._id, createdAt: { $gte: prevSince, $lt: since } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    const prevRevenue = prevRevenueAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        period,
        orderCount,
        revenue,
        prevOrderCount,
        prevRevenue,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch analytics",
        details: (error as Error).message,
      });
  }
};

export const getMyReviews = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: "Pharmacy not found" });
      return;
    }

    const reviews = await Review.find({ pharmacyId: pharmacy._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: reviews });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch reviews",
        details: (error as Error).message,
      });
  }
};

export const verifyPrescription = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const upload = await PrescriptionUpload.findById(id).lean();
    if (!upload) {
      res.status(404).json({ success: false, error: "Prescription not found" });
      return;
    }

    const order =
      upload.orderId != null
        ? await Order.findById(upload.orderId)
        : await Order.findOne({ prescriptionUploadId: upload._id });

    if (!order) {
      res.status(404).json({ success: false, error: "Linked order not found" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy || String(order.pharmacyId) !== String(pharmacy._id)) {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }

    if (upload.rejectedAt) {
      res
        .status(400)
        .json({ success: false, error: "Prescription was rejected" });
      return;
    }

    if (upload.verifiedAt && order.prescriptionVerified) {
      const updatedUpload = await PrescriptionUpload.findById(id);
      res.json({
        success: true,
        message: "Prescription verified",
        data: updatedUpload,
      });
      return;
    }

    await PrescriptionUpload.findByIdAndUpdate(id, {
      verifiedById: req.user.userId,
      verifiedAt: new Date(),
    });

    order.prescriptionVerified = true;
    order.statusHistory.push({
      status: order.status,
      actorId: new Types.ObjectId(req.user.userId),
      note: "Prescription verified by pharmacy",
      createdAt: new Date(),
    });
    await order.save();

    const updatedUpload = await PrescriptionUpload.findById(id);
    res.json({
      success: true,
      message: "Prescription verified",
      data: updatedUpload,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to verify prescription",
      details: (error as Error).message,
    });
  }
};

export const rejectPrescription = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ success: false, error: "Authentication required" });
      return;
    }

    const { id } = req.params;
    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";

    const upload = await PrescriptionUpload.findById(id);
    if (!upload) {
      res.status(404).json({ success: false, error: "Prescription not found" });
      return;
    }

    const order =
      upload.orderId != null
        ? await Order.findById(upload.orderId)
        : await Order.findOne({ prescriptionUploadId: upload._id });

    if (!order) {
      res.status(404).json({ success: false, error: "Linked order not found" });
      return;
    }

    const pharmacy = await Pharmacy.findOne({
      ownerId: req.user.userId,
    }).lean();
    if (!pharmacy || String(order.pharmacyId) !== String(pharmacy._id)) {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }

    if (upload.rejectedAt || upload.verifiedAt) {
      res
        .status(400)
        .json({ success: false, error: "Prescription already processed" });
      return;
    }

    upload.rejectedAt = new Date();
    upload.rejectedReason = note || undefined;
    upload.rejectedById = new Types.ObjectId(req.user.userId);
    await upload.save();

    order.status = "cancelled";
    order.paymentId = undefined;
    order.statusHistory.push({
      status: "cancelled",
      actorId: new Types.ObjectId(req.user.userId),
      note: note || "Prescription rejected",
      createdAt: new Date(),
    });
    await order.save();

    res.json({ success: true, message: "Prescription rejected", data: upload });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to reject prescription",
      details: (error as Error).message,
    });
  }
};
