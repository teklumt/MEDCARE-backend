import { Router } from "express";
import { EndUser } from "../../models/EndUser.js";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Driver } from "../../models/Driver.js";
import { DiseaseAlert } from "../../models/DiseaseAlert.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { successResponse } from "../../utils/response.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.use(requireRole("super_admin", "admin", "moderator"));

analyticsRouter.get("/overview", async (_req, res) => {
  const [users, pharmacies, drivers, ordersAgg] = await Promise.all([
    EndUser.countDocuments(),
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

analyticsRouter.get("/users", async (_req, res) => {
  const [regionBreakdown, banRates, signups] = await Promise.all([
    EndUser.aggregate([{ $group: { _id: "$region", count: { $sum: 1 } } }]),
    EndUser.aggregate([{ $group: { _id: "$ban.isBanned", count: { $sum: 1 } } }]),
    EndUser.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return successResponse(res, { signupsOverTime: signups, banRates, regionBreakdown });
});

analyticsRouter.get("/pharmacies", async (_req, res) => {
  const [status, ordersPerPharmacy] = await Promise.all([
    Pharmacy.aggregate([
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } },
        },
      },
    ]),
    Order.aggregate([{ $group: { _id: "$pharmacyId", orders: { $sum: 1 } } }, { $sort: { orders: -1 } }]),
  ]);

  return successResponse(res, { status: status[0] ?? { active: 0, suspended: 0 }, ordersPerPharmacy });
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

analyticsRouter.get("/licenses", async (_req, res) => {
  const counts = await Pharmacy.aggregate([{ $group: { _id: "$license.status", count: { $sum: 1 } } }]);
  const avgReview = await Pharmacy.aggregate([
    { $match: { "license.reviewedAt": { $ne: null } } },
    {
      $project: {
        reviewHours: {
          $divide: [
            { $subtract: ["$license.reviewedAt", "$createdAt"] },
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
  const [activeDrivers, deliveryStats] = await Promise.all([
    Driver.countDocuments({ status: { $in: ["available", "on_delivery", "offline"] }, isSuspended: false }),
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

  return successResponse(res, { activeDrivers, deliverySuccessRate: Number(successRate.toFixed(2)) });
});

analyticsRouter.get("/alerts", async (_req, res) => {
  const [totalAlerts, regionMentions] = await Promise.all([
    DiseaseAlert.countDocuments(),
    DiseaseAlert.aggregate([{ $unwind: "$affectedRegions" }, { $group: { _id: "$affectedRegions", count: { $sum: 1 } } }]),
  ]);

  return successResponse(res, { totalAlerts, regionMentions });
});
