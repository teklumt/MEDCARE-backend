import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/User.js", () => ({
  User: { countDocuments: jest.fn<any>(), aggregate: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Pharmacy.js", () => ({
  Pharmacy: { countDocuments: jest.fn<any>(), aggregate: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Order.js", () => ({
  Order: { countDocuments: jest.fn<any>(), aggregate: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Driver.js", () => ({
  Driver: { countDocuments: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/DiseaseAlert.js", () => ({
  DiseaseAlert: { countDocuments: jest.fn<any>(), aggregate: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/CommissionLedger.js", () => ({
  CommissionPaymentModel: {
    aggregate: jest.fn<any>().mockResolvedValue([{ total: 0 }]),
  },
  CommissionAccrualModel: { aggregate: jest.fn<any>().mockResolvedValue([]) },
}));

const User = (await import("../src/models/User.js")).User;
const Pharmacy = (await import("../src/models/Pharmacy.js")).Pharmacy;
const Order = (await import("../src/models/Order.js")).Order;
const Driver = (await import("../src/models/Driver.js")).Driver;
const DiseaseAlert = (await import("../src/models/DiseaseAlert.js"))
  .DiseaseAlert;
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Analytics routes", () => {
  const BASE = "/api/admin/analytics";
  const adminTok = adminToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /overview", () => {
    it("returns overview data", async () => {
      (User.countDocuments as any).mockResolvedValue(100);
      (Pharmacy.countDocuments as any).mockResolvedValue(20);
      (Driver.countDocuments as any).mockResolvedValue(30);
      (Order.aggregate as any).mockResolvedValue([
        { totalOrders: 500, revenue: 250000 },
      ]);
      (User.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/overview`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /users", () => {
    it("returns user analytics", async () => {
      (User.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/users`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /pharmacies", () => {
    it("returns pharmacy analytics", async () => {
      (Pharmacy.aggregate as any).mockResolvedValue([]);
      (Order.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/pharmacies`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /orders", () => {
    it("returns order analytics", async () => {
      (Order.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/orders`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /orders/today-kpis", () => {
    it("returns today KPIs", async () => {
      (Order.countDocuments as any).mockResolvedValue(12);
      (Order.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/orders/today-kpis`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /licenses", () => {
    it("returns license analytics", async () => {
      (Pharmacy.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/licenses`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /drivers", () => {
    it("returns driver analytics", async () => {
      (Driver.countDocuments as any).mockResolvedValue(30);
      (Order.aggregate as any).mockResolvedValue([
        { totalDeliveries: 20, totalOrders: 25 },
      ]);
      const res = await request(app)
        .get(`${BASE}/drivers`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /traffic", () => {
    it("returns traffic data", async () => {
      (Order.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/traffic`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /alerts", () => {
    it("returns alert analytics", async () => {
      (DiseaseAlert.countDocuments as any).mockResolvedValue(5);
      (DiseaseAlert.aggregate as any).mockResolvedValue([]);
      const res = await request(app)
        .get(`${BASE}/alerts`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("Unauthorized access — all analytics endpoints require auth", () => {
    it("returns 401 on /overview without token", async () => {
      const res = await request(app).get(`${BASE}/overview`);
      expect(res.status).toBe(401);
    });

    it("returns 401 on /users without token", async () => {
      const res = await request(app).get(`${BASE}/users`);
      expect(res.status).toBe(401);
    });

    it("returns 401 on /orders without token", async () => {
      const res = await request(app).get(`${BASE}/orders`);
      expect(res.status).toBe(401);
    });

    it("returns 401 on /drivers without token", async () => {
      const res = await request(app).get(`${BASE}/drivers`);
      expect(res.status).toBe(401);
    });

    it("returns 401 on /traffic without token", async () => {
      const res = await request(app).get(`${BASE}/traffic`);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /overview - response shape", () => {
    it("response has success flag", async () => {
      (User.countDocuments as any).mockResolvedValue(10);
      (Pharmacy.countDocuments as any).mockResolvedValue(5);
      (Driver.countDocuments as any).mockResolvedValue(8);
      (Order.aggregate as any).mockResolvedValue([{ totalOrders: 100, revenue: 50000 }]);
      (User.aggregate as any).mockResolvedValue([]);
      const res = await request(app).get(`${BASE}/overview`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("GET /orders/today-kpis - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/orders/today-kpis`);
      expect(res.status).toBe(401);
    });
  });
});
