import { Router } from "express";
import { query } from "express-validator";
import { Driver } from "../../models/Driver.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const driverManagementRouter = Router();
driverManagementRouter.use(requireAuth);

driverManagementRouter.get(
  "/",
  requireRole("admin"),
  query("status").optional().isIn(["online", "offline"]),
  query("pharmacy").optional().isString(),
  validateRequest,
  async (req, res) => {
    const { status, pharmacy } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status) filter.isOnline = status === "online";
    if (pharmacy) filter.pharmacyId = pharmacy;

    const drivers = await Driver.find(filter).sort({ createdAt: -1 }).lean();
    return successResponse(res, drivers);
  },
);

driverManagementRouter.get("/stats", requireRole("admin"), async (_req, res) => {
  const [total, online] = await Promise.all([
    Driver.countDocuments(),
    Driver.countDocuments({ isOnline: true }),
  ]);

  return successResponse(res, { total, online });
});

driverManagementRouter.get("/:id", requireRole("admin"), async (req, res) => {
  const driver = await Driver.findById(req.params.id).lean();
  if (!driver) return errorResponse(res, "Driver not found", "NOT_FOUND", 404);
  return successResponse(res, driver);
});
