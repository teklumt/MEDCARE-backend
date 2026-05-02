import { Router } from "express";
import { body } from "express-validator";
import { Admin } from "../../models/Admin.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";
import { validateRequest } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { logAudit } from "../../utils/audit.js";
import { authService } from "../../services/auth.service.js";

export const authAdminRouter = Router();

authAdminRouter.post(
  "/login",
  authRateLimiter,
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("totpCode").optional().isString(),
  validateRequest,
  async (req, res) => {
    const { email, password, totpCode } = req.body as { email: string; password: string; totpCode?: string };

    const result = await authService.login(email, password, totpCode);
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status, result.error.details);
    }

    const { accessToken, refreshToken, admin } = result.data!;

    await logAudit(req, "auth.login", "Admin", String(admin._id), { role: admin.role });

    return successResponse(res, {
      accessToken,
      refreshToken,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        mfaEnabled: admin.mfa.enabled,
      },
    });
  },
);

authAdminRouter.post(
  "/refresh",
  authRateLimiter,
  body("refreshToken").isString(),
  validateRequest,
  async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };

    const result = await authService.refresh(refreshToken);
    if (result.error) {
      return errorResponse(res, result.error.message, result.error.code, result.error.status);
    }

    return successResponse(res, { accessToken: result.data!.accessToken, refreshToken: result.data!.refreshToken });
  },
);

authAdminRouter.post(
  "/logout",
  requireAuth,
  body("refreshToken").isString(),
  validateRequest,
  async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout(req.admin!.id, refreshToken);

    await logAudit(req, "auth.logout", "Admin", req.admin?.id);
    return successResponse(res, { loggedOut: true });
  },
);

authAdminRouter.post("/mfa/setup", requireAuth, async (req, res) => {
  if (!req.admin || (req.admin.role !== "super_admin" && req.admin.role !== "admin")) {
    return errorResponse(res, "Only admin roles can setup MFA", "FORBIDDEN", 403);
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) {
    return errorResponse(res, "Admin not found", "NOT_FOUND", 404);
  }

  const { secret, otpauth, qrCodeDataUrl } = await authService.setupMfa(String(admin._id), admin.email);

  admin.mfa = { ...(admin.mfa ?? { enabled: false }), secret };
  await admin.save();

  await logAudit(req, "auth.mfa.setup", "Admin", String(admin._id));
  return successResponse(res, { secret, otpauth, qrCodeDataUrl });
});

authAdminRouter.post(
  "/mfa/verify",
  requireAuth,
  body("code").isString().isLength({ min: 6, max: 8 }),
  validateRequest,
  async (req, res) => {
    const admin = await Admin.findById(req.admin?.id);
    if (!admin || !admin.mfa?.secret) {
      return errorResponse(res, "MFA setup is not initialized", "MFA_NOT_SETUP", 400);
    }

    const { code } = req.body as { code: string };
    const verified = await authService.verifyMfaCode(admin.mfa.secret, code);
    if (!verified) {
      return errorResponse(res, "Invalid verification code", "MFA_INVALID", 401);
    }

    admin.mfa.enabled = true;
    await admin.save();

    await logAudit(req, "auth.mfa.verify", "Admin", String(admin._id));
    return successResponse(res, { mfaEnabled: true });
  },
);
