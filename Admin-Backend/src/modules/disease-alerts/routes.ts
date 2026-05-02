import { Router } from "express";
import { body, query } from "express-validator";
import { DiseaseAlert } from "../../models/DiseaseAlert.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { logAudit } from "../../utils/audit.js";

export const diseaseAlertRouter = Router();
diseaseAlertRouter.use(requireAuth);

diseaseAlertRouter.post(
  "/",
  requireRole("super_admin", "admin"),
  body("title").isString().isLength({ min: 3 }),
  body("description").isString().isLength({ min: 5 }),
  body("alertType").isIn(["malaria", "cholera", "marburg", "other"]),
  body("severity").isIn(["low", "moderate", "high", "critical"]),
  validateRequest,
  async (req, res) => {
    const payload = req.body;
    const alert = await DiseaseAlert.create({
      ...payload,
      createdBy: req.admin!.id,
      sentCount: 100,
      deliveredCount: 92,
      isActive: true,
    });

    await logAudit(req, "alert.create", "DiseaseAlert", String(alert._id), {
      regions: payload.affectedRegions?.length ?? 0,
    });

    return successResponse(res, alert, undefined, 201);
  },
);

diseaseAlertRouter.get("/", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const { severity, alertType, isActive } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (severity) filter.severity = severity;
  if (alertType) filter.alertType = alertType;
  if (typeof isActive !== "undefined") filter.isActive = isActive === "true";

  const alerts = await DiseaseAlert.find(filter).sort({ createdAt: -1 }).lean();
  return successResponse(res, alerts);
});

diseaseAlertRouter.patch(
  "/:id",
  requireRole("super_admin", "admin"),
  body("title").optional().isString(),
  body("description").optional().isString(),
  validateRequest,
  async (req, res) => {
    const alert = await DiseaseAlert.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
    if (!alert) return errorResponse(res, "Alert not found", "NOT_FOUND", 404);

    await logAudit(req, "alert.update", "DiseaseAlert", String(alert._id));
    return successResponse(res, alert);
  },
);

diseaseAlertRouter.delete("/:id", requireRole("super_admin", "admin"), async (req, res) => {
  const alert = await DiseaseAlert.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).lean();
  if (!alert) return errorResponse(res, "Alert not found", "NOT_FOUND", 404);

  await logAudit(req, "alert.deactivate", "DiseaseAlert", String(alert._id));
  return successResponse(res, { id: alert._id, isActive: alert.isActive });
});

diseaseAlertRouter.get("/:id/stats", requireRole("super_admin", "admin", "moderator"), async (req, res) => {
  const alert = await DiseaseAlert.findById(req.params.id).lean();
  if (!alert) return errorResponse(res, "Alert not found", "NOT_FOUND", 404);

  return successResponse(res, {
    id: alert._id,
    sentCount: alert.sentCount,
    deliveredCount: alert.deliveredCount,
    deliveryRate: alert.sentCount ? Number(((alert.deliveredCount / alert.sentCount) * 100).toFixed(2)) : 0,
  });
});
