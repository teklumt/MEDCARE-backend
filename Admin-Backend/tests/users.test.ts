import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/User.js", () => ({
  User: {
    find: jest.fn<any>().mockReturnThis(),
    findById: jest.fn<any>().mockReturnThis(),
    findByIdAndUpdate: jest.fn<any>(),
    findByIdAndDelete: jest.fn<any>(),
    countDocuments: jest.fn<any>(),
    sort: jest.fn<any>().mockReturnThis(),
    skip: jest.fn<any>().mockReturnThis(),
    limit: jest.fn<any>().mockReturnThis(),
    lean: jest.fn<any>(),
    select: jest.fn<any>(),
  },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({ AuditLog: { create: jest.fn<any>() } }));

const { User } = await import("../src/models/User.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("User Management routes", () => {
  const BASE = "/api/admin/users";
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("GET /", () => {
    it("lists users", async () => {
      (User as any).lean.mockResolvedValue([{ _id: "u1", email: "user@test.com", role: "patient" }]);
      (User.countDocuments as any).mockResolvedValue(1);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id", () => {
    it("deactivates user", async () => {
      (User.findByIdAndUpdate as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", isActive: false }) });
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011`).set("Authorization", `Bearer ${adminTok}`).send({ isActive: false });
      expect(res.status).toBe(200);
    });

    it("activates a previously deactivated user", async () => {
      (User.findByIdAndUpdate as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", isActive: true }) });
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011`).set("Authorization", `Bearer ${adminTok}`).send({ isActive: true });
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(true);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011`).send({ isActive: false });
      expect(res.status).toBe(401);
    });
  });

  describe("GET / - additional filters", () => {
    it("filters users by role query parameter", async () => {
      (User as any).lean.mockResolvedValue([{ _id: "u1", email: "pat@test.com", role: "patient" }]);
      (User.countDocuments as any).mockResolvedValue(1);
      const res = await request(app).get(`${BASE}/?role=patient`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });

    it("returns empty list when no users match filter", async () => {
      (User as any).lean.mockResolvedValue([]);
      (User.countDocuments as any).mockResolvedValue(0);
      const res = await request(app).get(`${BASE}/?isActive=false`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });

    it("response body has a data property", async () => {
      (User as any).lean.mockResolvedValue([]);
      (User.countDocuments as any).mockResolvedValue(0);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body).toHaveProperty("data");
      expect(res.body.success).toBe(true);
    });
  });
});
