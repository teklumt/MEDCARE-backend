import { Router } from "express";
import { query } from "express-validator";
import { DeliveryAssignment } from "../../models/DeliveryAssignment.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";

export const deliveryManagementRouter = Router();
deliveryManagementRouter.use(requireAuth);
deliveryManagementRouter.use(requireRole("admin"));

deliveryManagementRouter.get(
  "/",
  query("status").optional().isString(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  async (req, res) => {
    const { status, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      DeliveryAssignment.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(l).lean(),
      DeliveryAssignment.countDocuments(filter),
    ]);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);
