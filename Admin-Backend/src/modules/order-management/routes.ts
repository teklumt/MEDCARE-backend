import { Router } from "express";
import { query } from "express-validator";
import { Order } from "../../models/Order.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";

export const orderManagementRouter = Router();
orderManagementRouter.use(requireAuth);
orderManagementRouter.use(requireRole("admin"));

orderManagementRouter.get(
  "/",
  query("status").optional().isString(),
  query("pharmacyId").optional().isString(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  async (req, res) => {
    const { status, pharmacyId, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (pharmacyId) filter.pharmacyId = pharmacyId;

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Order.countDocuments(filter),
    ]);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);
