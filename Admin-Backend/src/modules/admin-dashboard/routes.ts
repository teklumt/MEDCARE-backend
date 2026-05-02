import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { successResponse } from "../../utils/response.js";
import { User } from "../../models/User.js";
import { Pharmacy } from "../../models/Pharmacy.js";
import { Order } from "../../models/Order.js";
import { Payment } from "../../models/Payment.js";
import { DeliveryAssignment } from "../../models/DeliveryAssignment.js";
import { Complaint } from "../../models/Complaint.js";

export const adminDashboardRouter = Router();
adminDashboardRouter.use(requireAuth);
adminDashboardRouter.use(requireRole("admin"));

adminDashboardRouter.get("/stats", async (_req, res) => {
  const [users, pharmacies, orders, paymentsAgg, deliveries, complaints] = await Promise.all([
    User.countDocuments(),
    Pharmacy.countDocuments(),
    Order.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, revenue: { $sum: "$amount" } } }]),
    DeliveryAssignment.countDocuments(),
    Complaint.countDocuments({ status: "open" }),
  ]);

  return successResponse(res, {
    totalUsers: users,
    totalPharmacies: pharmacies,
    totalOrders: orders,
    totalDeliveries: deliveries,
    totalRevenue: paymentsAgg[0]?.revenue ?? 0,
    openComplaints: complaints,
  });
});

adminDashboardRouter.get("/system-health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  return successResponse(res, {
    status: "ok",
    dbState,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
