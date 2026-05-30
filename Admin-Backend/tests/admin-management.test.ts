import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/services/admin.service.js", () => ({
  adminService: {
    createAdmin: jest.fn<any>(),
    listAdmins: jest.fn<any>(),
    updateRole: jest.fn<any>(),
    suspend: jest.fn<any>(),
    softDelete: jest.fn<any>(),
  },
}));
jest.unstable_mockModule("../src/models/User.js", () => ({
  User: { findById: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({
  AuditLog: { create: jest.fn<any>().mockResolvedValue({}) },
}));

const { adminService } = await import("../src/services/admin.service.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken, patientToken } = await import("./helpers.js");

describe("Admin Management routes", () => {
  const BASE = "/api/admin/admins";
  const adminTok = adminToken();
  const patientTok = patientToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("POST /create", () => {
    const validBody = { email: "newadmin@test.com", phone: "+251911111111", password: "securePass123" };

    it("creates admin", async () => {
      (adminService.createAdmin as any).mockResolvedValue({ data: { _id: "new-id", email: "newadmin@test.com", role: "admin" } });
      const res = await request(app).post(`${BASE}/create`).set("Authorization", `Bearer ${adminTok}`).send(validBody);
      expect(res.status).toBe(201);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).post(`${BASE}/create`).send(validBody);
      expect(res.status).toBe(401);
    });

    it("returns 403 for patient role", async () => {
      const res = await request(app).post(`${BASE}/create`).set("Authorization", `Bearer ${patientTok}`).send(validBody);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /", () => {
    it("lists admins", async () => {
      (adminService.listAdmins as any).mockResolvedValue({ items: [{ _id: "a1", email: "a@b.com" }], total: 1 });
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id/role", () => {
    it("updates role", async () => {
      (adminService.updateRole as any).mockResolvedValue({ data: { _id: "some-id", role: "admin" } });
      const res = await request(app).patch(`${BASE}/some-id/role`).set("Authorization", `Bearer ${adminTok}`).send({ role: "admin" });
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id/suspend", () => {
    it("suspends admin", async () => {
      (adminService.suspend as any).mockResolvedValue({ data: { _id: "some-id", isActive: false } });
      const res = await request(app).patch(`${BASE}/some-id/suspend`).set("Authorization", `Bearer ${adminTok}`).send({ reason: "Policy violation" });
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:id", () => {
    it("soft-deletes admin", async () => {
      (adminService.softDelete as any).mockResolvedValue({ data: { _id: "some-id", deleted: true } });
      const res = await request(app).delete(`${BASE}/some-id`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).delete(`${BASE}/some-id`);
      expect(res.status).toBe(401);
    });

    it("returns 403 for patient role", async () => {
      const res = await request(app).delete(`${BASE}/some-id`).set("Authorization", `Bearer ${patientTok}`);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /create - validation", () => {
    it("returns 422 on invalid email format", async () => {
      const res = await request(app).post(`${BASE}/create`).set("Authorization", `Bearer ${adminTok}`).send({ email: "not-an-email", phone: "+251911111111", password: "securePass123" });
      expect(res.status).toBe(422);
    });

    it("returns 422 on missing phone", async () => {
      const res = await request(app).post(`${BASE}/create`).set("Authorization", `Bearer ${adminTok}`).send({ email: "new@test.com", password: "securePass123" });
      expect(res.status).toBe(422);
    });

    it("returns 409 on duplicate email", async () => {
      (adminService.createAdmin as any).mockResolvedValue({ error: { message: "Email already in use", code: "DUPLICATE_EMAIL", status: 409 } });
      const res = await request(app).post(`${BASE}/create`).set("Authorization", `Bearer ${adminTok}`).send({ email: "exists@test.com", phone: "+251911111111", password: "securePass123" });
      expect(res.status).toBe(409);
    });
  });

  describe("GET / - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });

    it("response contains data and success fields", async () => {
      (adminService.listAdmins as any).mockResolvedValue({ items: [], total: 0 });
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("PATCH /:id/role - validation", () => {
    it("returns 422 on missing role field", async () => {
      const res = await request(app).patch(`${BASE}/some-id/role`).set("Authorization", `Bearer ${adminTok}`).send({});
      expect(res.status).toBe(422);
    });
  });

  describe("PATCH /:id/suspend - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).patch(`${BASE}/some-id/suspend`).send({ reason: "Test" });
      expect(res.status).toBe(401);
    });
  });
});
