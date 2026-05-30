import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/Pharmacy.js", () => ({
  Pharmacy: {
    find: jest.fn<any>().mockReturnThis(),
    findById: jest.fn<any>(),
    countDocuments: jest.fn<any>(),
    sort: jest.fn<any>().mockReturnThis(),
    skip: jest.fn<any>().mockReturnThis(),
    limit: jest.fn<any>().mockReturnThis(),
    lean: jest.fn<any>(),
    populate: jest.fn<any>().mockReturnThis(),
  },
}));
jest.unstable_mockModule("../src/models/User.js", () => ({ User: {} }));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({ AuditLog: { create: jest.fn<any>() } }));

const { Pharmacy } = await import("../src/models/Pharmacy.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("License Verification routes", () => {
  const BASE = "/api/admin/licenses";
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("GET /", () => {
    it("lists verifications", async () => {
      (Pharmacy as any).lean.mockResolvedValue([{ _id: "507f1f77bcf86cd799439011", status: "pending" }]);
      (Pharmacy.countDocuments as any).mockResolvedValue(1);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id/approve", () => {
    it("approves a license", async () => {
      const mockPharmacy = { _id: "507f1f77bcf86cd799439011", license: { status: "pending" }, save: jest.fn<any>().mockResolvedValue({}) };
      (Pharmacy.findById as any).mockResolvedValue(mockPharmacy);

      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/approve`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id/reject", () => {
    it("rejects with reason", async () => {
      const mockPharmacy = { _id: "507f1f77bcf86cd799439011", license: { status: "pending" }, save: jest.fn<any>().mockResolvedValue({}) };
      (Pharmacy.findById as any).mockResolvedValue(mockPharmacy);

      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/reject`).set("Authorization", `Bearer ${adminTok}`).send({ reason: "Missing docs" });
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id/revoke", () => {
    it("revokes verified license", async () => {
      const mockPharmacy = { _id: "507f1f77bcf86cd799439011", license: { status: "verified" }, save: jest.fn<any>().mockResolvedValue({}) };
      (Pharmacy.findById as any).mockResolvedValue(mockPharmacy);

      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/revoke`).set("Authorization", `Bearer ${adminTok}`).send({ reason: "Non-compliance" });
      expect(res.status).toBe(200);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/revoke`).send({ reason: "Test" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET / - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });

    it("filters by pending status via query param", async () => {
      (Pharmacy as any).lean.mockResolvedValue([{ _id: "507f1f77bcf86cd799439011", license: { status: "pending" } }]);
      (Pharmacy.countDocuments as any).mockResolvedValue(1);
      const res = await request(app).get(`${BASE}/?status=pending`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });

    it("returns empty list when no matching licenses", async () => {
      (Pharmacy as any).lean.mockResolvedValue([]);
      (Pharmacy.countDocuments as any).mockResolvedValue(0);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("PATCH /:id/approve - edge cases", () => {
    it("returns 404 when pharmacy not found", async () => {
      (Pharmacy.findById as any).mockResolvedValue(null);
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439099/approve`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /:id/reject - validation", () => {
    it("returns 422 when reason is missing", async () => {
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/reject`).set("Authorization", `Bearer ${adminTok}`).send({});
      expect(res.status).toBe(422);
    });
  });
});
