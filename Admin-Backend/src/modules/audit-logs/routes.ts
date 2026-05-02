import { Router } from "express";
import { AuditLog } from "../../models/AuditLog.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";

export const auditLogRouter = Router();
auditLogRouter.use(requireAuth);
auditLogRouter.use(requireRole("super_admin", "admin", "moderator"));

auditLogRouter.get("/", async (req, res) => {
  const { adminId, action, startDate, endDate, page, limit } = req.query as Record<string, string>;
  const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

  const filter: Record<string, unknown> = {};
  if (adminId) filter.adminId = adminId;
  if (action) filter.action = action;
  if (startDate || endDate) {
    filter.timestamp = {
      ...(startDate ? { $gte: new Date(startDate) } : {}),
      ...(endDate ? { $lte: new Date(endDate) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(l).lean(),
    AuditLog.countDocuments(filter),
  ]);

  return successResponse(res, items, { page: p, limit: l, total });
});
