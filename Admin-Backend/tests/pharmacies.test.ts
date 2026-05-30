import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/Pharmacy.js", () => ({
  Pharmacy: {
    find: jest.fn<any>().mockReturnThis(),
    findById: jest.fn<any>(),
    findByIdAndUpdate: jest.fn<any>(),
    countDocuments: jest.fn<any>(),
    sort: jest.fn<any>().mockReturnThis(),
    lean: jest.fn<any>(),
  },
}));
jest.unstable_mockModule("../src/models/Order.js", () => ({
  Order: { find: jest.fn<any>().mockReturnThis(), countDocuments: jest.fn<any>(), sort: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Review.js", () => ({
  Review: { find: jest.fn<any>().mockReturnThis(), countDocuments: jest.fn<any>(), sort: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/CommissionLedger.js", () => ({
  CommissionAccrualModel: { aggregate: jest.fn<any>().mockResolvedValue([]) }, CommissionPaymentModel: { aggregate: jest.fn<any>().mockResolvedValue([]) },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({ AuditLog: { create: jest.fn<any>() } }));

const { Pharmacy } = await import("../src/models/Pharmacy.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Pharmacy Management routes", () => {
  const BASE = "/api/admin/pharmacies";
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("GET /", () => {
    it("lists pharmacies", async () => {
      (Pharmacy as any).lean.mockResolvedValue([{ _id: "507f1f77bcf86cd799439011", businessName: "Test Pharmacy" }]);
      (Pharmacy.countDocuments as any).mockResolvedValue(1);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id/suspend", () => {
    it("suspends pharmacy", async () => {
      const mock = { _id: "507f1f77bcf86cd799439011", isActive: true, save: jest.fn<any>().mockResolvedValue({}) };
      (Pharmacy.findById as any).mockResolvedValue(mock);

      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/suspend`).set("Authorization", `Bearer ${adminTok}`).send({ reason: "Policy violation" });
      expect(res.status).toBe(200);
      expect(mock.isActive).toBe(false);
    });
  });

  describe("PATCH /:id/activate", () => {
    it("reactivates pharmacy", async () => {
      const mock = { _id: "507f1f77bcf86cd799439011", isActive: false, save: jest.fn<any>().mockResolvedValue({}) };
      (Pharmacy.findById as any).mockResolvedValue(mock);

      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/activate`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
      expect(mock.isActive).toBe(true);
    });
  });

  describe("PATCH /:id/badge", () => {
    it("toggles badge", async () => {
      (Pharmacy.findByIdAndUpdate as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", badge: true }) });

      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/badge`).set("Authorization", `Bearer ${adminTok}`).send({ enabled: true });
      expect(res.status).toBe(200);
    });

    it("disables badge", async () => {
      (Pharmacy.findByIdAndUpdate as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", badge: false }) });
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/badge`).set("Authorization", `Bearer ${adminTok}`).send({ enabled: false });
      expect(res.status).toBe(200);
    });
  });

  describe("GET / - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });

    it("response body has data and success properties", async () => {
      (Pharmacy as any).lean.mockResolvedValue([]);
      (Pharmacy.countDocuments as any).mockResolvedValue(0);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body).toHaveProperty("data");
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /:id/suspend - edge cases", () => {
    it("returns 404 when pharmacy not found", async () => {
      (Pharmacy.findById as any).mockResolvedValue(null);
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439099/suspend`).set("Authorization", `Bearer ${adminTok}`).send({ reason: "Policy violation" });
      expect(res.status).toBe(404);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/suspend`).send({ reason: "Test" });
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /:id/activate - edge cases", () => {
    it("returns 404 when pharmacy not found", async () => {
      (Pharmacy.findById as any).mockResolvedValue(null);
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439099/activate`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(404);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).patch(`${BASE}/507f1f77bcf86cd799439011/activate`);
      expect(res.status).toBe(401);
    });
  });
});
