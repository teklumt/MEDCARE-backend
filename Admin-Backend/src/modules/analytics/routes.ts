import { Router } from "express";
import { User } from "../../models/User.js";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Driver } from "../../models/Driver.js";
import { DiseaseAlert } from "../../models/DiseaseAlert.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { successResponse } from "../../utils/response.js";

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
