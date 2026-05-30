import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/User.js", () => ({ User: { countDocuments: jest.fn<any>() } }));
jest.unstable_mockModule("../src/models/Pharmacy.js", () => ({ Pharmacy: { countDocuments: jest.fn<any>() } }));
jest.unstable_mockModule("../src/models/Order.js", () => ({ Order: { countDocuments: jest.fn<any>() } }));
jest.unstable_mockModule("../src/models/Payment.js", () => ({ Payment: { aggregate: jest.fn<any>() } }));
jest.unstable_mockModule("../src/models/DeliveryAssignment.js", () => ({ DeliveryAssignment: { countDocuments: jest.fn<any>() } }));
jest.unstable_mockModule("../src/models/Complaint.js", () => ({ Complaint: { countDocuments: jest.fn<any>() } }));

const User = (await import("../src/models/User.js")).User;
const Pharmacy = (await import("../src/models/Pharmacy.js")).Pharmacy;
const Order = (await import("../src/models/Order.js")).Order;
const Payment = (await import("../src/models/Payment.js")).Payment;
const DeliveryAssignment = (await import("../src/models/DeliveryAssignment.js")).DeliveryAssignment;
const Complaint = (await import("../src/models/Complaint.js")).Complaint;
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Admin Dashboard routes", () => {
  const BASE = "/api/admin";
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("GET /stats", () => {
    it("returns aggregated stats", async () => {
      (User.countDocuments as any).mockResolvedValue(10);
      (Pharmacy.countDocuments as any).mockResolvedValue(5);
      (Order.countDocuments as any).mockResolvedValue(100);
      (Payment.aggregate as any).mockResolvedValue([{ revenue: 50000 }]);
      (DeliveryAssignment.countDocuments as any).mockResolvedValue(30);
      (Complaint.countDocuments as any).mockResolvedValue(2);

      const res = await request(app).get(`${BASE}/stats`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBe(10);
      expect(res.body.data.totalPharmacies).toBe(5);
      expect(res.body.data.totalRevenue).toBe(50000);
    });

    it("returns 0 revenue on empty payments", async () => {
      (User.countDocuments as any).mockResolvedValue(0);
      (Pharmacy.countDocuments as any).mockResolvedValue(0);
      (Order.countDocuments as any).mockResolvedValue(0);
      (Payment.aggregate as any).mockResolvedValue([]);
      (DeliveryAssignment.countDocuments as any).mockResolvedValue(0);
      (Complaint.countDocuments as any).mockResolvedValue(0);

      const res = await request(app).get(`${BASE}/stats`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.data.totalRevenue).toBe(0);
    });
  });

  describe("GET /system-health", () => {
    it("returns health info", async () => {
      const res = await request(app).get(`${BASE}/system-health`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("ok");
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/system-health`);
      expect(res.status).toBe(401);
    });

    it("response has success flag set to true", async () => {
      const res = await request(app).get(`${BASE}/system-health`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /stats - guards and field presence", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/stats`);
      expect(res.status).toBe(401);
    });

    it("response contains all required top-level stat fields", async () => {
      (User.countDocuments as any).mockResolvedValue(5);
      (Pharmacy.countDocuments as any).mockResolvedValue(3);
      (Order.countDocuments as any).mockResolvedValue(50);
      (Payment.aggregate as any).mockResolvedValue([{ revenue: 25000 }]);
      (DeliveryAssignment.countDocuments as any).mockResolvedValue(10);
      (Complaint.countDocuments as any).mockResolvedValue(1);

      const res = await request(app).get(`${BASE}/stats`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.data).toHaveProperty("totalUsers");
      expect(res.body.data).toHaveProperty("totalPharmacies");
      expect(res.body.data).toHaveProperty("totalOrders");
      expect(res.body.data).toHaveProperty("totalRevenue");
    });

    it("counts match mocked values exactly", async () => {
      (User.countDocuments as any).mockResolvedValue(42);
      (Pharmacy.countDocuments as any).mockResolvedValue(7);
      (Order.countDocuments as any).mockResolvedValue(200);
      (Payment.aggregate as any).mockResolvedValue([{ revenue: 99000 }]);
      (DeliveryAssignment.countDocuments as any).mockResolvedValue(55);
      (Complaint.countDocuments as any).mockResolvedValue(3);

      const res = await request(app).get(`${BASE}/stats`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.data.totalUsers).toBe(42);
      expect(res.body.data.totalPharmacies).toBe(7);
      expect(res.body.data.totalRevenue).toBe(99000);
    });
  });
});
