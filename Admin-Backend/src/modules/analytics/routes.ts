import { Router } from "express";
import { User } from "../../models/User.js";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Driver } from "../../models/Driver.js";
import { DiseaseAlert } from "../../models/DiseaseAlert.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { ADDIS_ABABA_TIMEZONE, getAddisAbabaDayRangeUtc } from "../../utils/addisAbabaDayRange.js";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Rolling last 24 hours, one bucket per hour (UTC). Keys match $dateToString %Y-%m-%dT%H */
function expectedHourlyBucketKeys(): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now - i * 60 * 60 * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const h = String(d.getUTCHours()).padStart(2, "0");
    keys.push(`${y}-${m}-${day}T${h}`);
  }
  return keys;
}

function labelForHourlyKey(key: string): string {
  const [ymd, hh] = key.split("T");
  const [y, mo, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, Number(hh), 0, 0, 0));
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}, ${String(date.getUTCHours()).padStart(2, "0")}:00`;
}

/** Last N calendar days UTC ending today (inclusive), YYYY-MM-DD */
function expectedDailyBucketKeys(numDays: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function labelForDayKey(ymd: string): string {
  const [y, mo, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
  const wk = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()];
  return `${wk} ${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.use(requireRole("admin"));

analyticsRouter.get("/overview", async (_req, res) => {
  const [users, pharmacies, drivers, ordersAgg] = await Promise.all([
    User.countDocuments(),
    Pharmacy.countDocuments(),
    Driver.countDocuments(),
    Order.aggregate([{ $group: { _id: null, totalOrders: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }]),
  ]);

  return successResponse(res, {
    totalUsers: users,
    totalPharmacies: pharmacies,
    totalDrivers: drivers,
    totalOrders: ordersAgg[0]?.totalOrders ?? 0,
    totalRevenue: ordersAgg[0]?.revenue ?? 0,
  });
});

analyticsRouter.get("/traffic", async (req, res) => {
  const range = typeof req.query.range === "string" ? req.query.range : "24h";
  if (!["24h", "7d", "30d"].includes(range)) {
    return errorResponse(res, "Invalid range; use 24h, 7d, or 30d", "VALIDATION_ERROR", 422);
  }

  const now = Date.now();

  if (range === "24h") {
    const start = new Date(now - 24 * 60 * 60 * 1000);
    const expectedKeys = expectedHourlyBucketKeys();
    const rows = await Order.aggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%dT%H", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);
    const map = new Map(rows.map((r) => [r._id, r.count]));
    const series = expectedKeys.map((key) => ({
      label: labelForHourlyKey(key),
      count: map.get(key) ?? 0,
    }));
    return successResponse(res, { metric: "orders", series });
  }

  const numDays = range === "7d" ? 7 : 30;
  const expectedKeys = expectedDailyBucketKeys(numDays);
  const startStr = expectedKeys[0];
  const start = new Date(`${startStr}T00:00:00.000Z`);

  const rows = await Order.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.count]));
  const series = expectedKeys.map((key) => ({
    label: labelForDayKey(key),
    count: map.get(key) ?? 0,
  }));
  return successResponse(res, { metric: "orders", series });
});

analyticsRouter.get("/users", async (_req, res) => {
  const [roleBreakdown, languageBreakdown, signups] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: "$language", count: { $sum: 1 } } }]),
    User.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return successResponse(res, { signupsOverTime: signups, roleBreakdown, languageBreakdown });
});

analyticsRouter.get("/pharmacies", async (_req, res) => {
  const [status, ordersPerPharmacy] = await Promise.all([
    Pharmacy.aggregate([
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
        },
      },
    ]),
    Order.aggregate([{ $group: { _id: "$pharmacyId", orders: { $sum: 1 } } }, { $sort: { orders: -1 } }]),
  ]);

  return successResponse(res, { status: status[0] ?? { active: 0, inactive: 0 }, ordersPerPharmacy });
});

analyticsRouter.get("/orders", async (_req, res) => {
  const [status, revenueTrends] = await Promise.all([
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const peakHours = await Order.aggregate([
    { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  return successResponse(res, { byStatus: status, revenueTrends, peakHours });
});

/**
 * Admin Platform Orders headline KPIs (stats strip).
 * - ordersToday: count where createdAt falls in the current calendar day in Africa/Addis_Ababa.
 * - revenueTodayEt: sum totalAmount for those orders where paymentStatus is success or cod_collected.
 * - avgFulfillmentMinutes: among orders created that day, delivered with deliveredAt set — average
 *   (deliveredAt - createdAt) in whole minutes; null if none.
 * - stuckOrders: status pending and createdAt at least 30 minutes ago (wall-clock).
 */
analyticsRouter.get("/orders/today-kpis", async (_req, res) => {
  const { start, endExclusive, dayLabelAddis } = getAddisAbabaDayRangeUtc();
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const createdTodayRange = { $gte: start, $lt: endExclusive };

  const [ordersToday, revenueAgg, fulfillmentAgg, stuckOrders] = await Promise.all([
    Order.countDocuments({ createdAt: createdTodayRange }),
    Order.aggregate<{ _id: null; total: number }>([
      {
        $match: {
          createdAt: createdTodayRange,
          paymentStatus: { $in: ["success", "cod_collected"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate<{ _id: null; avgMs: number | null }>([
      {
        $match: {
          createdAt: createdTodayRange,
          status: "delivered",
          deliveredAt: { $ne: null },
        },
      },
      {
        $project: {
          ms: { $subtract: ["$deliveredAt", "$createdAt"] },
        },
      },
      { $group: { _id: null, avgMs: { $avg: "$ms" } } },
    ]),
    Order.countDocuments({
      status: "pending",
      createdAt: { $lte: thirtyMinutesAgo },
    }),
  ]);

  const revenueTodayEt = revenueAgg[0]?.total ?? 0;
  const avgMs = fulfillmentAgg[0]?.avgMs;
  const avgFulfillmentMinutes =
    avgMs != null && !Number.isNaN(avgMs) ? Math.round(avgMs / (60 * 1000)) : null;

  return successResponse(res, {
    timezone: ADDIS_ABABA_TIMEZONE,
    dayStartAddis: dayLabelAddis,
    ordersToday,
    revenueTodayEt,
    avgFulfillmentMinutes,
    stuckOrders,
  });
});

analyticsRouter.get("/licenses", async (_req, res) => {
  const counts = await Pharmacy.aggregate([{ $group: { _id: "$verification.status", count: { $sum: 1 } } }]);
  const avgReview = await Pharmacy.aggregate([
    { $match: { "verification.verifiedAt": { $ne: null } } },
    {
      $project: {
        reviewHours: {
          $divide: [
            { $subtract: ["$verification.verifiedAt", "$createdAt"] },
            1000 * 60 * 60,
          ],
        },
      },
    },
    { $group: { _id: null, avgReviewHours: { $avg: "$reviewHours" } } },
  ]);

  return successResponse(res, { counts, avgReviewTimeHours: avgReview[0]?.avgReviewHours ?? 0 });
});

analyticsRouter.get("/drivers", async (_req, res) => {
  const [totalAgents, onlineAgents, deliveryStats] = await Promise.all([
    Driver.countDocuments(),
    Driver.countDocuments({ isOnline: true }),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalOrders = deliveryStats[0]?.totalOrders ?? 0;
  const successRate = totalOrders ? ((deliveryStats[0]?.totalDeliveries ?? 0) / totalOrders) * 100 : 0;

  return successResponse(res, { totalAgents, onlineAgents, deliverySuccessRate: Number(successRate.toFixed(2)) });
});

analyticsRouter.get("/alerts", async (_req, res) => {
  const [totalAlerts, regionMentions] = await Promise.all([
    DiseaseAlert.countDocuments(),
    DiseaseAlert.aggregate([{ $group: { _id: "$region", count: { $sum: 1 } } }]),
  ]);

  return successResponse(res, { totalAlerts, regionMentions });
});
