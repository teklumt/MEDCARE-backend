import { Router } from "express";
import { body } from "express-validator";
import { User } from "../../models/User.js";
import { validateRequest } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import { logAudit } from "../../utils/audit.js";
import { authService } from "../../services/auth.service.js";
import { registrationService } from "../../services/registration.service.js";
import { pharmacySignupVerificationService } from "../../services/pharmacy-signup-verification.service.js";
import { passwordResetService } from "../../services/password-reset.service.js";

/** Attach Resend/SMTP error text (non-production services only — see password-reset / signup verification). */
function mailFailureDiagnostic(result: { ok: false; diagnostic?: string }): { diagnostic: string } | undefined {
  const d = result.diagnostic;
  if (typeof d === "string" && d.trim() !== "") {
    return { diagnostic: d };
  }
  return undefined;
}

export const authAdminRouter = Router();

authAdminRouter.post(
  "/forgot-password/send-code",
  body("email").isEmail(),
  validateRequest,
  async (req, res) => {
    const email = (req.body as { email: string }).email;
    const result = await passwordResetService.requestCode(email);
    if (!result.ok) {
      const status =
        result.code === "SMTP_NOT_CONFIGURED"
          ? 503
          : result.code === "EMAIL_SEND_FAILED"
            ? 502
            : 400;
      return errorResponse(res, result.message, result.code, status, mailFailureDiagnostic(result));
    }
    return successResponse(res, {
      sent: true,
      message: "If an account exists for this email, a reset code has been sent.",
    });
  },
);

authAdminRouter.post(
  "/forgot-password/reset",
  body("email").isEmail(),
  body("verificationCode").isString().trim().matches(/^\d{6}$/).withMessage("Must be a 6-digit code"),
  body("newPassword").isString().isLength({ min: 8, max: 128 }),
  validateRequest,
  async (req, res) => {
    const raw = req.body as { email: string; verificationCode: string; newPassword: string };
    const result = await passwordResetService.resetWithCode(
      raw.email,
      raw.verificationCode,
      raw.newPassword,
    );
    if (!result.ok) {
      const status = result.code === "TOO_MANY_ATTEMPTS" ? 429 : 400;
      return errorResponse(res, result.message, result.code, status);
    }
    await logAudit(req, "auth.password_reset.completed", "User", result.userId);
    return successResponse(res, { reset: true });
  },
);

authAdminRouter.post(
  "/register/patient/send-verification",
  body("email").isEmail(),
  validateRequest,
  async (req, res) => {
    const email = (req.body as { email: string }).email;
    const result = await pharmacySignupVerificationService.sendCode(email, "patient_register");
    if (!result.ok) {
      const status =
        result.code === "DUPLICATE_EMAIL"
          ? 409
          : result.code === "SMTP_NOT_CONFIGURED"
            ? 503
            : result.code === "EMAIL_SEND_FAILED"
              ? 502
              : 400;
      return errorResponse(res, result.message, result.code, status, mailFailureDiagnostic(result));
    }
    return successResponse(res, { sent: true });
  },
);

authAdminRouter.post(
  "/register/patient",
  body("username").isString().trim().isLength({ min: 2, max: 40 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("phone").isString().trim().notEmpty(),
  body("language").optional().isIn(["en", "am"]),
  body("verificationCode").isString().trim().matches(/^\d{6}$/).withMessage("Must be a 6-digit code"),
  validateRequest,
  async (req, res) => {
    const raw = req.body as {
      verificationCode: string;
      username: string;
      email: string;
      password: string;
      phone: string;
      language?: "en" | "am";
    };

    const verify = await pharmacySignupVerificationService.verifyAndConsume(
      raw.email,
      raw.verificationCode,
      "patient_register",
    );
    if (!verify.ok) {
      const status = verify.code === "TOO_MANY_ATTEMPTS" ? 429 : 400;
      return errorResponse(res, verify.message, verify.code, status);
    }

    const { verificationCode: _vc, ...registerBody } = raw;
    const result = await registrationService.registerPatient(registerBody);
    if ("error" in result) {
      const e = result.error;
      return errorResponse(res, e.message, e.code, e.status);
    }
    await logAudit(req, "auth.register.patient", "User", result.data.user.id, { role: "patient" });
    return successResponse(res, { user: result.data.user, tokens: result.data.tokens });
  },
);

authAdminRouter.post(
  "/register/pharmacy/send-verification",
  body("email").isEmail(),
  validateRequest,
  async (req, res) => {
    const email = (req.body as { email: string }).email;
    const result = await pharmacySignupVerificationService.sendCode(email, "pharmacy_register");
    if (!result.ok) {
      const status =
        result.code === "DUPLICATE_EMAIL"
          ? 409
          : result.code === "SMTP_NOT_CONFIGURED"
            ? 503
            : result.code === "EMAIL_SEND_FAILED"
              ? 502
              : 400;
      return errorResponse(res, result.message, result.code, status, mailFailureDiagnostic(result));
    }
    return successResponse(res, { sent: true });
  },
);

authAdminRouter.post(
  "/register/pharmacy",
  body("businessName").isString().trim().isLength({ min: 2, max: 120 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("phone").isString().trim().notEmpty(),
  body("businessLicenseNumber").isString().trim().isLength({ min: 2 }),
  body("issuingAuthority").optional().isString().trim(),
  body("businessLicenseExpiry").optional().isISO8601(),
  body("professionalLicenseExpiry").optional().isISO8601(),
  body("businessRegistrationUrl").optional().isString().isLength({ min: 4, max: 2000 }),
  body("operatingLicenseUrl").optional().isString().isLength({ min: 4, max: 2000 }),
  body("location").optional().isString().trim(),
  body("address").optional().isString().trim(),
  body("language").optional().isIn(["en", "am"]),
  body("verificationCode").isString().trim().matches(/^\d{6}$/).withMessage("Must be a 6-digit code"),
  validateRequest,
  async (req, res) => {
    const raw = req.body as {
      verificationCode: string;
      businessName: string;
      email: string;
      password: string;
      phone: string;
      businessLicenseNumber: string;
      issuingAuthority?: string;
      businessLicenseExpiry?: string;
      professionalLicenseExpiry?: string;
      businessRegistrationUrl?: string;
      operatingLicenseUrl?: string;
      location?: string;
      address?: string;
      language?: "en" | "am";
    };

    const verify = await pharmacySignupVerificationService.verifyAndConsume(
      raw.email,
      raw.verificationCode,
      "pharmacy_register",
    );
    if (!verify.ok) {
      const status =
        verify.code === "TOO_MANY_ATTEMPTS"
          ? 429
          : 400;
      return errorResponse(res, verify.message, verify.code, status);
    }

    const { verificationCode: _vc, ...registerBody } = raw;
    const result = await registrationService.registerPharmacy(registerBody);
    if ("error" in result) {
      const e = result.error;
      return errorResponse(res, e.message, e.code, e.status);
    }
    await logAudit(req, "auth.register.pharmacy", "User", result.data.user.id, { role: "pharmacy" });
    return successResponse(res, { user: result.data.user, tokens: result.data.tokens });
  },
);

authAdminRouter.post(
  "/register/delivery/send-verification",
  body("email").isEmail(),
  validateRequest,
  async (req, res) => {
    const email = (req.body as { email: string }).email;
    const result = await pharmacySignupVerificationService.sendCode(email, "delivery_register");
    if (!result.ok) {
      const status =
        result.code === "DUPLICATE_EMAIL"
          ? 409
          : result.code === "SMTP_NOT_CONFIGURED"
            ? 503
            : result.code === "EMAIL_SEND_FAILED"
              ? 502
              : 400;
      return errorResponse(res, result.message, result.code, status, mailFailureDiagnostic(result));
    }
    return successResponse(res, { sent: true });
  },
);

authAdminRouter.post(
  "/register/delivery",
  body("fullName").isString().trim().isLength({ min: 2, max: 100 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("phone").isString().trim().notEmpty(),
  body("nationalId").isString().trim().isLength({ min: 1, max: 64 }),
  body("vehicleType").isString().trim().notEmpty(),
  body("licensePlate").optional().isString().trim(),
  body("pharmacyId").isString().trim().notEmpty(),
  body("language").optional().isIn(["en", "am"]),
  body("verificationCode").isString().trim().matches(/^\d{6}$/).withMessage("Must be a 6-digit code"),
  validateRequest,
  async (req, res) => {
    const raw = req.body as {
      verificationCode: string;
      fullName: string;
      email: string;
      password: string;
      phone: string;
      nationalId: string;
      vehicleType: string;
      licensePlate?: string;
      pharmacyId: string;
      language?: "en" | "am";
    };

    const verify = await pharmacySignupVerificationService.verifyAndConsume(
      raw.email,
      raw.verificationCode,
      "delivery_register",
    );
    if (!verify.ok) {
      const status = verify.code === "TOO_MANY_ATTEMPTS" ? 429 : 400;
      return errorResponse(res, verify.message, verify.code, status);
    }

    const { verificationCode: _vc, ...registerBody } = raw;
    const result = await registrationService.registerDelivery(registerBody);
    if ("error" in result) {
      const e = result.error;
      return errorResponse(res, e.message, e.code, e.status);
    }
    await logAudit(req, "auth.register.delivery", "User", result.data.user.id, { role: "delivery" });
    return successResponse(res, { user: result.data.user, tokens: result.data.tokens });
  },
);

authAdminRouter.post(
  "/login",
  body("email").isEmail(),
  body("password").isString().isLength({ min: 8 }),
  body("totpCode").optional().isString(),
  validateRequest,
  async (req, res) => {
    const { email, password, totpCode } = req.body as { email: string; password: string; totpCode?: string };

    const result = await authService.login(email, password, totpCode);
    if ("error" in result) {
      const e = result.error;
      return errorResponse(res, e.message, e.code, e.status, e.details);
    }

    const { user, tokens } = result.data;

    await logAudit(req, "auth.login", "User", user.id, { role: user.role });

    return successResponse(res, {
      user,
      tokens,
    });
  },
);

authAdminRouter.post(
  "/refresh",
  body("refreshToken").isString(),
  validateRequest,
  async (req, res) => {
    const { refreshToken } = req.body as { refreshToken: string };

    const result = await authService.refresh(refreshToken);
    if ("error" in result) {
      const e = result.error!;
      return errorResponse(res, e.message, e.code, e.status);
    }

    const { user, tokens } = result.data;

    return successResponse(res, { user, tokens });
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

    await logAudit(req, "auth.logout", "User", req.admin?.id);
    return successResponse(res, { loggedOut: true });
  },
);

authAdminRouter.post("/mfa/setup", requireAuth, async (req, res) => {
  if (!req.admin || req.admin.role !== "admin") {
    return errorResponse(res, "Only admin roles can setup MFA", "FORBIDDEN", 403);
  }

  const admin = await User.findById(req.admin.id);
  if (!admin) {
    return errorResponse(res, "Admin not found", "NOT_FOUND", 404);
  }

  const { secret, otpauth, qrCodeDataUrl } = await authService.setupMfa(String(admin._id), admin.email);

  admin.mfa = { ...(admin.mfa ?? { enabled: false }), secret };
  await admin.save();

  await logAudit(req, "auth.mfa.setup", "User", String(admin._id));
  return successResponse(res, { secret, otpauth, qrCodeDataUrl });
});

authAdminRouter.post(
  "/mfa/verify",
  requireAuth,
  body("code").isString().isLength({ min: 6, max: 8 }),
  validateRequest,
  async (req, res) => {
    const admin = await User.findById(req.admin?.id);
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

    await logAudit(req, "auth.mfa.verify", "User", String(admin._id));
    return successResponse(res, { mfaEnabled: true });
  },
);
