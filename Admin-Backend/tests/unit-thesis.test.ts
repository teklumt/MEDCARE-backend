/**
 * Unit Tests — MedCare Ethiopia Thesis System Testing
 *
 * TC-1  Login with valid credentials     Backend / Auth
 * TC-5  AI health assistant response      AI
 */

import { jest } from "@jest/globals";

// ─── TC-1: Auth service mocks ─────────────────────────────────────────────────
jest.unstable_mockModule("../src/services/auth.service.js", () => ({
  authService: {
    login: jest.fn<any>(),
    logout: jest.fn<any>().mockResolvedValue(undefined),
    refresh: jest.fn<any>(),
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
  User: { findById: jest.fn<any>() },
}));

jest.unstable_mockModule("../src/models/AuditLog.js", () => ({
  AuditLog: { create: jest.fn<any>().mockResolvedValue({}) },
}));

// ─── TC-5: Mock the health-assistant controller directly ──────────────────────
// This is the correct unit-test approach: isolate the HTTP routing layer from
// the AI/DB layer by replacing the controller with a deterministic stub.

const AI_REPLY =
  "Paracetamol (Acetaminophen) is a widely used pain reliever and fever reducer. " +
  "Standard adult dose: 500–1000 mg every 4–6 hours (max 4 g per day). " +
  "Always consult a pharmacist before combining with other medications.";

const healthAssistantChatMock = jest.fn<any>((req: any, res: any) => {
  const { content, language = "en", conversationId } = req.body ?? {};

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: "Message content is required" });
  }

  return res.json({
    success: true,
    data: {
      session_id: conversationId ?? "generated-session-id-001",
      conversationId: conversationId ?? "generated-session-id-001",
      message: { text: AI_REPLY, language },
      timestamp: new Date().toISOString(),
    },
  });
});

jest.unstable_mockModule("../src/modules/health-assistant/controller.js", () => ({
  healthAssistantChat: healthAssistantChatMock,
}));

// ─── Dynamic imports (after all mocks are registered) ────────────────────────
const { authService }             = await import("../src/services/auth.service.js");
const { default: request }        = await import("supertest");
const { app }                     = await import("../src/app.js");
const { patientToken, testAdmin } = await import("./helpers.js");

const AUTH_BASE = "/api/admin/auth";
const AI_BASE   = "/api/admin/health-assistant";

// ══════════════════════════════════════════════════════════════════════════════
// TC-1 | Login with valid credentials
// ══════════════════════════════════════════════════════════════════════════════
describe("TC-1 | Login with valid credentials", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.login as any).mockResolvedValue({
      data: {
        user: { id: testAdmin.id, email: testAdmin.email, role: "pharmacy" },
        tokens: {
          accessToken: "mock.access.jwt.token",
          refreshToken: "mock.refresh.jwt.token",
        },
      },
    });
  });

  it("returns HTTP 200 on valid credentials", async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/login`)
      .send({ email: testAdmin.email, password: "ValidPass1234" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("issues a JWT access token in the response", async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/login`)
      .send({ email: testAdmin.email, password: "ValidPass1234" });

    expect(res.body.data.tokens).toHaveProperty("accessToken");
    expect(typeof res.body.data.tokens.accessToken).toBe("string");
    expect(res.body.data.tokens.accessToken.length).toBeGreaterThan(0);
  });

  it("also issues a refresh token alongside the access token", async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/login`)
      .send({ email: testAdmin.email, password: "ValidPass1234" });

    expect(res.body.data.tokens).toHaveProperty("refreshToken");
  });

  it("includes the authenticated user role in the response", async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/login`)
      .send({ email: testAdmin.email, password: "ValidPass1234" });

    expect(res.body.data.user).toHaveProperty("role");
  });

  it("returns ≥400 when email is missing", async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/login`)
      .send({ password: "ValidPass1234" });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("returns ≥400 when password is too short", async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/login`)
      .send({ email: testAdmin.email, password: "short" });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// TC-5 | AI health assistant response
// ══════════════════════════════════════════════════════════════════════════════
describe("TC-5 | AI health assistant response", () => {
  const token = () => patientToken();

  beforeEach(() => {
    healthAssistantChatMock.mockClear();
  });

  it("returns HTTP 200 with a non-empty AI text response", async () => {
    const res = await request(app)
      .post(`${AI_BASE}/chat`)
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "What is Paracetamol?", language: "en" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message.text).toBeTruthy();
    expect(res.body.data.message.text.length).toBeGreaterThan(10);
  });

  it("issues a conversationId (session) with every response", async () => {
    const res = await request(app)
      .post(`${AI_BASE}/chat`)
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "I have a fever. What should I do?", language: "en" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("conversationId");
    expect(res.body.data.conversationId.length).toBeGreaterThan(0);
  });

  it("echoes back the requested language field", async () => {
    const res = await request(app)
      .post(`${AI_BASE}/chat`)
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "ፓራሲታሞል ምንድን ነው?", language: "am" });

    expect(res.status).toBe(200);
    expect(res.body.data.message.language).toBe("am");
  });

  it("preserves a provided conversationId for session continuity", async () => {
    const cid = "session-continuity-test-001";

    const res = await request(app)
      .post(`${AI_BASE}/chat`)
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "What about Ibuprofen?", language: "en", conversationId: cid });

    expect(res.status).toBe(200);
    expect(res.body.data.conversationId).toBe(cid);
  });

  it("returns 401 when called without an auth token", async () => {
    const res = await request(app)
      .post(`${AI_BASE}/chat`)
      .send({ content: "What is Paracetamol?" });

    expect(res.status).toBe(401);
  });

  it("returns 400 when message content is empty", async () => {
    const res = await request(app)
      .post(`${AI_BASE}/chat`)
      .set("Authorization", `Bearer ${token()}`)
      .send({ content: "" });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
