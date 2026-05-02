import { Router } from "express";
import { body, query } from "express-validator";
import { Complaint } from "../../models/Complaint.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";

export const complaintManagementRouter = Router();
complaintManagementRouter.use(requireAuth);
complaintManagementRouter.use(requireRole("admin"));

complaintManagementRouter.get(
  "/",
  query("severity").optional().isIn(["low", "medium", "high"]),
  query("status").optional().isIn(["open", "resolved", "dismissed"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  async (req, res) => {
    const { severity, status, page, limit } = req.query as Record<string, string>;
    const { skip, page: p, limit: l } = getPagination({ page: Number(page), limit: Number(limit) });

    const filter: Record<string, unknown> = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      Complaint.countDocuments(filter),
    ]);

    return successResponse(res, items, { page: p, limit: l, total });
  },
);

complaintManagementRouter.patch(
  "/:id",
  body("status").isIn(["open", "resolved", "dismissed"]),
  body("resolution").optional().isString(),
  validateRequest,
  async (req, res) => {
    const { status, resolution } = req.body as { status: "open" | "resolved" | "dismissed"; resolution?: string };

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return errorResponse(res, "Complaint not found", "NOT_FOUND", 404);

    complaint.status = status;
    complaint.resolution = resolution ?? complaint.resolution ?? null;
    complaint.resolvedById = req.admin!.id as any;
    complaint.resolvedAt = status === "resolved" ? new Date() : complaint.resolvedAt ?? null;
    await complaint.save();

    await logAudit(req, "complaint.update", "Complaint", String(complaint._id), { status });
    return successResponse(res, { id: complaint._id, status: complaint.status });
  },
);
