import { Router } from "express";
import { body, query } from "express-validator";
import mongoose from "mongoose";
import { Complaint } from "../../models/Complaint.js";
import { Notification } from "../../models/Notification.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { getPagination } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";

/** PATCH may use MongoDB id or human-readable `ref` (e.g. CMP-001). */
async function findComplaintByIdentifier(param: string) {
  if (mongoose.Types.ObjectId.isValid(param)) {
    const byId = await Complaint.findById(param);
    if (byId) return byId;
  }
  return Complaint.findOne({ ref: param });
}

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

    const complaint = await findComplaintByIdentifier(String(req.params.id));
    if (!complaint) return errorResponse(res, "Complaint not found", "NOT_FOUND", 404);

    const prevStatus = complaint.status;

    complaint.status = status;
    complaint.resolution = resolution ?? complaint.resolution ?? null;
    complaint.resolvedById = status === "resolved" ? (req.admin!.id as any) : null;
    complaint.resolvedAt = status === "resolved" ? new Date() : null;
    await complaint.save();

    const becameTerminal =
      (status === "resolved" || status === "dismissed") &&
      prevStatus !== "resolved" &&
      prevStatus !== "dismissed";

    if (becameTerminal) {
      try {
        const cref = complaint.ref || String(complaint._id);
        const resolved = status === "resolved";
        await Notification.create({
          recipientId: complaint.reporterId,
          category: "complaint",
          event: resolved ? "complaint_resolved" : "complaint_dismissed",
          title: resolved ? "Complaint resolved" : "Complaint dismissed",
          body: resolved
            ? `Your complaint ${cref} has been resolved.`
            : `Your complaint ${cref} was dismissed.`,
          entityType: "complaint",
          entityId: complaint._id,
          readAt: null,
        });
      } catch (nErr) {
        console.warn("[notifications] Reporter outcome notification skipped:", (nErr as Error)?.message);
      }
    }

    await logAudit(req, "complaint.update", "Complaint", String(complaint._id), { status });
    return successResponse(res, { id: complaint._id, status: complaint.status });
  },
);
