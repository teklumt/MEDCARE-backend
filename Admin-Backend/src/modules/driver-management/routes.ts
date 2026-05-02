import { Router } from "express";
import { body } from "express-validator";
import { Driver } from "../../models/Driver.js";
import { Order } from "../../models/Order.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { requireMFA } from "../../middleware/mfa.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { logAudit } from "../../utils/audit.js";

export const driverManagementRouter = Router();
driverManagementRouter.use(requireAuth);

driverManagementRouter.get("/", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const { status, region, pharmacy } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (region) filter.region = region;
  if (pharmacy) filter.assignedPharmacyId = pharmacy;

  const drivers = await Driver.find(filter).sort({ createdAt: -1 }).lean();
  return successResponse(res, drivers);
});

driverManagementRouter.get("/stats", requireRole("super_admin", "admin", "moderator"), async (_req, res) => {
  const stats = await Driver.aggregate([
    {
      $group: {
        _id: "$region",
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $in: ["$status", ["available", "on_delivery", "offline"]] }, 1, 0] } },
        suspended: { $sum: { $cond: [{ $eq: ["$isSuspended", true] }, 1, 0] } },
      },
    },
  ]);

  return successResponse(res, stats);
});

driverManagementRouter.get("/:id", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const driver = await Driver.findById(req.params.id).lean();
  if (!driver) return errorResponse(res, "Driver not found", "NOT_FOUND", 404);
  return successResponse(res, driver);
});

driverManagementRouter.post(
  "/:id/background-check",
  requireRole("super_admin", "admin"),
  body("status").isIn(["pending", "cleared", "failed"]),
  validateRequest,
  async (req, res) => {
    const { status } = req.body as { status: "pending" | "cleared" | "failed" };
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: { "backgroundCheck.status": status, "backgroundCheck.reviewedBy": req.admin!.id, "backgroundCheck.reviewedAt": new Date() } },
      { new: true },
    ).lean();

    if (!driver) return errorResponse(res, "Driver not found", "NOT_FOUND", 404);
    await logAudit(req, "driver.background_check", "Driver", String(driver._id), { status });
    return successResponse(res, { id: driver._id, backgroundCheckStatus: driver.backgroundCheck?.status });
  },
);

driverManagementRouter.patch(
  "/:id/suspend",
  requireRole("super_admin", "admin"),
  requireMFA,
  body("reason").isString().isLength({ min: 3 }),
  validateRequest,
  async (req, res) => {
    const { reason } = req.body as { reason: string };
    const driver = await Driver.findById(req.params.id);
    if (!driver) return errorResponse(res, "Driver not found", "NOT_FOUND", 404);

    driver.isSuspended = true;
    driver.status = "suspended";
    driver.suspendedReason = reason;
    driver.suspendedBy = req.admin!.id as any;
    await driver.save();

    await logAudit(req, "driver.suspend", "Driver", String(driver._id), { reason });
    return successResponse(res, { id: driver._id, status: driver.status, isSuspended: driver.isSuspended });
  },
);

driverManagementRouter.patch("/:id/activate", requireRole("super_admin", "admin"), async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) return errorResponse(res, "Driver not found", "NOT_FOUND", 404);

  driver.isSuspended = false;
  driver.status = "available";
  driver.suspendedReason = undefined;
  await driver.save();

  await logAudit(req, "driver.activate", "Driver", String(driver._id));
  return successResponse(res, { id: driver._id, status: driver.status, isSuspended: driver.isSuspended });
});

driverManagementRouter.get("/:id/deliveries", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const deliveries = await Order.find({ driverId: req.params.id }).sort({ createdAt: -1 }).lean();
  return successResponse(res, deliveries);
});
