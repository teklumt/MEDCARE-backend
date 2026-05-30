import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/services/auth.service.js", () => ({
  authService: {
    login: jest.fn<any>(),
    refresh: jest.fn<any>(),
    logout: jest.fn<any>(),
    setupMfa: jest.fn<any>(),
    verifyMfaCode: jest.fn<any>(),
  },
}));

jest.unstable_mockModule("../src/services/registration.service.js", () => ({
  registrationService: {
    registerPatient: jest.fn<any>(),
    registerPharmacy: jest.fn<any>(),
    registerDelivery: jest.fn<any>(),
  },
}));

jest.unstable_mockModule("../src/services/pharmacy-signup-verification.service.js", () => ({
  pharmacySignupVerificationService: {
    sendCode: jest.fn<any>(),
    verifyAndConsume: jest.fn<any>(),
  },
}));

jest.unstable_mockModule("../src/services/password-reset.service.js", () => ({
  passwordResetService: {
    requestCode: jest.fn<any>(),
    resetWithCode: jest.fn<any>(),
  },
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  User: {
    findById: jest.fn<any>(),
  },
}));

jest.unstable_mockModule("../src/models/AuditLog.js", () => ({
  AuditLog: { create: jest.fn<any>().mockResolvedValue({}) },
}));

const { authService } = await import("../src/services/auth.service.js");
const { registrationService } = await import("../src/services/registration.service.js");
const { pharmacySignupVerificationService } = await import(
  "../src/services/pharmacy-signup-verification.service.js",
);
const { passwordResetService } = await import("../src/services/password-reset.service.js");
const { User } = await import("../src/models/User.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken, testAdmin } = await import("./helpers.js");

describe("Auth routes", () => {
  const BASE = "/api/admin/auth";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /login", () => {
    it("returns 200 + tokens on valid credentials", async () => {
      (authService.login as any).mockResolvedValue({
        data: { user: { id: testAdmin.id, email: testAdmin.email, role: "admin" }, tokens: { accessToken: "a", refreshToken: "b" } },
      });

      const res = await request(app).post(`${BASE}/login`).send({ email: testAdmin.email, password: "validPass123" });
      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBe("a");
    });

    it("returns 401 on invalid credentials", async () => {
      (authService.login as any).mockResolvedValue({ error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS", status: 401 } });

      const res = await request(app).post(`${BASE}/login`).send({ email: testAdmin.email, password: "password12345" });
      expect(res.status).toBe(401);
    });

    it("returns 422 on missing email", async () => {
      const res = await request(app).post(`${BASE}/login`).send({ password: "somePass123" });
      expect(res.status).toBe(422);
    });

    it("accepts optional totpCode", async () => {
      (authService.login as any).mockResolvedValue({
        data: { user: { id: testAdmin.id }, tokens: { accessToken: "a", refreshToken: "b" } },
      });

      const res = await request(app).post(`${BASE}/login`).send({ email: testAdmin.email, password: "validPass123", totpCode: "123456" });
      expect(res.status).toBe(200);
      expect(authService.login).toHaveBeenCalledWith(testAdmin.email, "validPass123", "123456");
    });
  });

  describe("POST /refresh", () => {
    it("returns 200 with new tokens", async () => {
      (authService.refresh as any).mockResolvedValue({
        data: { user: { id: testAdmin.id }, tokens: { accessToken: "new_a", refreshToken: "new_b" } },
      });

      const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken: "valid-refresh-token" });
      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBe("new_a");
    });
  });

  describe("POST /logout", () => {
    it("returns 200 when authenticated", async () => {
      (authService.logout as any).mockResolvedValue(undefined);

      const res = await request(app).post(`${BASE}/logout`).set("Authorization", `Bearer ${adminToken()}`).send({ refreshToken: "some-token" });
      expect(res.status).toBe(200);
      expect(res.body.data.loggedOut).toBe(true);
    });

    it("returns 401 without token", async () => {
      const res = await request(app).post(`${BASE}/logout`).send({ refreshToken: "x" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /mfa/setup", () => {
    it("returns 200 with QR code for admin", async () => {
      (User.findById as any).mockResolvedValue({ _id: testAdmin.id, email: testAdmin.email, mfa: {}, save: jest.fn<any>() });
      (authService.setupMfa as any).mockResolvedValue({ secret: "SECRET", otpauth: "otpauth://...", qrCodeDataUrl: "data:image/png;base64,..." });

      const res = await request(app).post(`${BASE}/mfa/setup`).set("Authorization", `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.secret).toBe("SECRET");
    });

    it("returns 403 for non-admin role", async () => {
      const res = await request(app).post(`${BASE}/mfa/setup`).set("Authorization", `Bearer ${adminToken({ role: "patient" as any })}`);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /mfa/verify", () => {
    it("returns 200 on valid code", async () => {
      (User.findById as any).mockResolvedValue({ _id: testAdmin.id, mfa: { secret: "SECRET" }, save: jest.fn<any>() });
      (authService.verifyMfaCode as any).mockResolvedValue(true);

      const res = await request(app).post(`${BASE}/mfa/verify`).set("Authorization", `Bearer ${adminToken()}`).send({ code: "123456" });
      expect(res.status).toBe(200);
      expect(res.body.data.mfaEnabled).toBe(true);
    });

    it("returns 400 when MFA not setup", async () => {
      (User.findById as any).mockResolvedValue({ _id: testAdmin.id, mfa: {} });

      const res = await request(app).post(`${BASE}/mfa/verify`).set("Authorization", `Bearer ${adminToken()}`).send({ code: "123456" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /forgot-password/send-code", () => {
    it("returns 200 when email exists", async () => {
      (passwordResetService.requestCode as any).mockResolvedValue({ ok: true });

      const res = await request(app).post(`${BASE}/forgot-password/send-code`).send({ email: "admin@test.com" });
      expect(res.status).toBe(200);
      expect(res.body.data.sent).toBe(true);
    });

    it("returns 503 when SMTP not configured", async () => {
      (passwordResetService.requestCode as any).mockResolvedValue({ ok: false, code: "SMTP_NOT_CONFIGURED", message: "SMTP not configured" });
      const res = await request(app).post(`${BASE}/forgot-password/send-code`).send({ email: "any@test.com" });
      expect(res.status).toBe(503);
    });
  });

  describe("POST /forgot-password/reset", () => {
    it("returns 200 on valid reset", async () => {
      (passwordResetService.resetWithCode as any).mockResolvedValue({ ok: true, userId: testAdmin.id });

      const res = await request(app).post(`${BASE}/forgot-password/reset`).send({ email: "admin@test.com", verificationCode: "123456", newPassword: "newSecurePass123" });
      expect(res.status).toBe(200);
      expect(res.body.data.reset).toBe(true);
    });

    it("returns 429 on too many attempts", async () => {
      (passwordResetService.resetWithCode as any).mockResolvedValue({ ok: false, code: "TOO_MANY_ATTEMPTS", message: "Too many attempts" });
      const res = await request(app).post(`${BASE}/forgot-password/reset`).send({ email: "admin@test.com", verificationCode: "123456", newPassword: "newSecurePass123" });
      expect(res.status).toBe(429);
    });
  });

  describe("send-verification endpoints", () => {
    for (const role of ["patient", "pharmacy", "delivery"] as const) {
      it(`sends verification for ${role}`, async () => {
        (pharmacySignupVerificationService.sendCode as any).mockResolvedValue({ ok: true });

        const res = await request(app).post(`${BASE}/register/${role}/send-verification`).send({ email: "new@test.com" });
        expect(res.status).toBe(200);
      });

      it(`returns 409 for duplicate ${role} email`, async () => {
        (pharmacySignupVerificationService.sendCode as any).mockResolvedValue({ ok: false, code: "DUPLICATE_EMAIL", message: "Duplicate email" });
        const res = await request(app).post(`${BASE}/register/${role}/send-verification`).send({ email: "exists@test.com" });
        expect(res.status).toBe(409);
      });
    }
  });

  describe("POST /register/patient", () => {
    it("registers patient with valid data", async () => {
      (pharmacySignupVerificationService.verifyAndConsume as any).mockResolvedValue({ ok: true });
      (registrationService.registerPatient as any).mockResolvedValue({
        data: { user: { id: "new-user-id" }, tokens: { accessToken: "a", refreshToken: "b" } },
      });

      const res = await request(app).post(`${BASE}/register/patient`).send({
        username: "TestUser", email: "new@test.com", password: "securePass123",
        phone: "+251911111111", verificationCode: "123456",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe("new-user-id");
    });
  });

  describe("POST /login - additional validation", () => {
    it("returns 422 on missing password", async () => {
      const res = await request(app).post(`${BASE}/login`).send({ email: testAdmin.email });
      expect(res.status).toBe(422);
    });

    it("returns 422 on invalid email format", async () => {
      const res = await request(app).post(`${BASE}/login`).send({ email: "not-an-email", password: "somePass123" });
      expect(res.status).toBe(422);
    });

    it("propagates 503 when auth service is unavailable", async () => {
      (authService.login as any).mockResolvedValue({ error: { message: "Service unavailable", code: "SERVICE_UNAVAILABLE", status: 503 } });
      const res = await request(app).post(`${BASE}/login`).send({ email: testAdmin.email, password: "validPass123" });
      expect(res.status).toBe(503);
    });
  });

  describe("POST /refresh - edge cases", () => {
    it("returns 422 on missing refreshToken body", async () => {
      const res = await request(app).post(`${BASE}/refresh`).send({});
      expect(res.status).toBe(422);
    });

    it("propagates error status when refresh token is expired", async () => {
      (authService.refresh as any).mockResolvedValue({ error: { message: "Token expired", code: "TOKEN_EXPIRED", status: 401 } });
      const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken: "expired-token" });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("POST /mfa/verify - additional", () => {
    it("returns 400 on incorrect TOTP code", async () => {
      (User.findById as any).mockResolvedValue({ _id: testAdmin.id, mfa: { secret: "SECRET" } });
      (authService.verifyMfaCode as any).mockResolvedValue(false);
      const res = await request(app).post(`${BASE}/mfa/verify`).set("Authorization", `Bearer ${adminToken()}`).send({ code: "000000" });
      expect(res.status).toBe(400);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).post(`${BASE}/mfa/verify`).send({ code: "123456" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /forgot-password/reset - error scenarios", () => {
    it("returns 400 on expired verification code", async () => {
      (passwordResetService.resetWithCode as any).mockResolvedValue({ ok: false, code: "CODE_EXPIRED", message: "Code expired" });
      const res = await request(app).post(`${BASE}/forgot-password/reset`).send({ email: "admin@test.com", verificationCode: "000000", newPassword: "newSecurePass123" });
      expect(res.status).toBe(400);
    });

    it("returns 400 on wrong verification code", async () => {
      (passwordResetService.resetWithCode as any).mockResolvedValue({ ok: false, code: "INVALID_CODE", message: "Wrong code" });
      const res = await request(app).post(`${BASE}/forgot-password/reset`).send({ email: "admin@test.com", verificationCode: "999999", newPassword: "newSecurePass123" });
      expect(res.status).toBe(400);
    });

    it("returns 422 on missing newPassword field", async () => {
      const res = await request(app).post(`${BASE}/forgot-password/reset`).send({ email: "admin@test.com", verificationCode: "123456" });
      expect(res.status).toBe(422);
    });
  });

  describe("POST /register/pharmacy", () => {
    it("registers pharmacy owner with valid data", async () => {
      (pharmacySignupVerificationService.verifyAndConsume as any).mockResolvedValue({ ok: true });
      (registrationService.registerPharmacy as any).mockResolvedValue({
        data: { user: { id: "pharm-user-id" }, tokens: { accessToken: "x", refreshToken: "y" } },
      });
      const res = await request(app).post(`${BASE}/register/pharmacy`).send({
        username: "PharmOwner", email: "pharm@test.com", password: "securePass123",
        phone: "+251911222222", verificationCode: "123456",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe("pharm-user-id");
    });

    it("returns 400 on invalid verification code", async () => {
      (pharmacySignupVerificationService.verifyAndConsume as any).mockResolvedValue({ ok: false, code: "INVALID_CODE" });
      const res = await request(app).post(`${BASE}/register/pharmacy`).send({
        username: "PharmOwner", email: "pharm@test.com", password: "securePass123",
        phone: "+251911222222", verificationCode: "000000",
      });
      expect(res.status).toBe(400);
    });

    it("returns 422 on missing required fields", async () => {
      const res = await request(app).post(`${BASE}/register/pharmacy`).send({ email: "pharm@test.com" });
      expect(res.status).toBe(422);
    });
  });

  describe("POST /register/delivery", () => {
    it("registers delivery personnel with valid data", async () => {
      (pharmacySignupVerificationService.verifyAndConsume as any).mockResolvedValue({ ok: true });
      (registrationService.registerDelivery as any).mockResolvedValue({
        data: { user: { id: "delivery-user-id" }, tokens: { accessToken: "x", refreshToken: "y" } },
      });
      const res = await request(app).post(`${BASE}/register/delivery`).send({
        username: "Courier1", email: "courier@test.com", password: "securePass123",
        phone: "+251911333333", verificationCode: "123456",
      });
      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe("delivery-user-id");
    });

    it("returns 400 on invalid verification code for delivery", async () => {
      (pharmacySignupVerificationService.verifyAndConsume as any).mockResolvedValue({ ok: false, code: "INVALID_CODE" });
      const res = await request(app).post(`${BASE}/register/delivery`).send({
        username: "Courier1", email: "courier@test.com", password: "securePass123",
        phone: "+251911333333", verificationCode: "000000",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /logout - additional", () => {
    it("returns 422 on missing refreshToken body", async () => {
      const res = await request(app).post(`${BASE}/logout`).set("Authorization", `Bearer ${adminToken()}`).send({});
      expect(res.status).toBe(422);
    });
  });
});
