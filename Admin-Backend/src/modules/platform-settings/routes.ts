import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/role.js";
import { validateRequest } from "../../middleware/validate.js";
import { successResponse } from "../../utils/response.js";
import { logAudit } from "../../utils/audit.js";
import {
  getGeneralPlatformSettings,
  upsertGeneralPlatformSettings,
} from "../../services/platform-settings.service.js";

export const platformSettingsRouter = Router();
platformSettingsRouter.use(requireAuth);
platformSettingsRouter.use(requireRole("admin"));

platformSettingsRouter.get("/", async (_req, res) => {
  const settings = await getGeneralPlatformSettings();
  return successResponse(res, settings);
});

platformSettingsRouter.patch(
  "/",
  body("platformName").optional().isString().trim().notEmpty().isLength({ max: 200 }),
  body("supportEmail").optional().isEmail(),
  body("commissionRatePercent").optional().isFloat({ min: 0, max: 100 }),
  body("defaultDeliveryRadiusKm").optional().isFloat({ min: 0.1, max: 500 }),
  body("maintenanceMode").optional().isBoolean(),
  validateRequest,
  async (req, res) => {
    const bodyInput = req.body as Partial<{
      platformName: string;
      supportEmail: string;
      commissionRatePercent: number;
      defaultDeliveryRadiusKm: number;
      maintenanceMode: boolean;
    }>;

    const updatedKeys = Object.keys(bodyInput).filter(
      (k) => bodyInput[k as keyof typeof bodyInput] !== undefined,
    );

    const updated =
      updatedKeys.length === 0
        ? await getGeneralPlatformSettings()
        : await upsertGeneralPlatformSettings(bodyInput);

    if (updatedKeys.length > 0) {
      await logAudit(req, "platform.settings.update", "PlatformConfig", undefined, {
        keys: updatedKeys,
      });
    }

    return successResponse(res, updated);
  },
);
