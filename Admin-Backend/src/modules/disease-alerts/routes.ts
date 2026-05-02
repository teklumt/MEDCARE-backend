import { Router } from "express";
import { body, query } from "express-validator";
import { HealthAlert } from "../../models/HealthAlert.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { logAudit } from "../../utils/audit.js";

export const diseaseAlertRouter = Router();
diseaseAlertRouter.use(requireAuth);

diseaseAlertRouter.post(
  "/",
  requireRole("admin"),
  body("type").isIn(["Disease Outbreak", "Medication Recall", "Emergency Health Advisory"]),
  body("region").isString().isLength({ min: 2 }),
  body("message").isString().isLength({ min: 5 }),
  body("details").optional().isString(),
  body("youtubeLink").optional().isString(),
  validateRequest,
  async (req, res) => {
    const payload = req.body as {
      type: "Disease Outbreak" | "Medication Recall" | "Emergency Health Advisory";
      region: string;
      message: string;
      details?: string;
      youtubeLink?: string;
    };

    const alert = await HealthAlert.create({
      ...payload,
      createdById: req.admin!.id as any,
      isActive: true,
    });

    await logAudit(req, "alert.create", "HealthAlert", String(alert._id));
    return successResponse(res, alert, undefined, 201);
  },
);

diseaseAlertRouter.get(
  "/",
  requireRole("admin"),
  query("type").optional().isString(),
  query("region").optional().isString(),
  query("isActive").optional().isBoolean(),
  validateRequest,
  async (req, res) => {
    const { type, region, isActive } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (type) filter.type = type;
    if (region) filter.region = region;
    if (typeof isActive !== "undefined") filter.isActive = isActive === "true";

    const alerts = await HealthAlert.find(filter).sort({ createdAt: -1 }).lean();
    return successResponse(res, alerts);
  },
);

diseaseAlertRouter.patch(
  "/:id",
  requireRole("admin"),
  body("type").optional().isString(),
  body("region").optional().isString(),
  body("message").optional().isString(),
  body("details").optional().isString(),
  body("youtubeLink").optional().isString(),
  body("isActive").optional().isBoolean(),
  validateRequest,
  async (req, res) => {
    const alert = await HealthAlert.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).lean();
    if (!alert) return errorResponse(res, "Alert not found", "NOT_FOUND", 404);

    await logAudit(req, "alert.update", "HealthAlert", String(alert._id));
    return successResponse(res, alert);
  },
);

diseaseAlertRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  const alert = await HealthAlert.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true }).lean();
  if (!alert) return errorResponse(res, "Alert not found", "NOT_FOUND", 404);

  await logAudit(req, "alert.deactivate", "HealthAlert", String(alert._id));
  return successResponse(res, { id: alert._id, isActive: alert.isActive });
});
