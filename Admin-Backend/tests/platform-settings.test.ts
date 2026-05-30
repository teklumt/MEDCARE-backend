import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/PlatformConfig.js", () => ({
  PlatformConfig: { find: jest.fn<any>(), findOne: jest.fn<any>(), findOneAndUpdate: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({ AuditLog: { create: jest.fn<any>() } }));

const { PlatformConfig } = await import("../src/models/PlatformConfig.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Platform Settings routes", () => {
  const BASE = "/api/admin/platform-settings";
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("GET /", () => {
    it("returns settings", async () => {
      (PlatformConfig.find as any).mockReturnValue({
        lean: jest.fn<any>().mockResolvedValue([
          { key: "platform.name", value: "MedCare Platform" },
          { key: "platform.support_email", value: "support@medcare-et.com" },
          { key: "platform.commission_etb_per_delivered_order", value: "10" },
          { key: "platform.default_delivery_radius_km", value: "15" },
          { key: "platform.maintenance_mode", value: "false" },
        ]),
      });

      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
      expect(res.body.data.platformName).toBe("MedCare Platform");
    });

    it("returns defaults when no config", async () => {
      (PlatformConfig.find as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue([]) });

      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
      expect(res.body.data.platformName).toBe("MedCare Platform");
    });
  });

  describe("PATCH /", () => {
    it("updates settings", async () => {
      (PlatformConfig.find as any).mockReturnValue({
        lean: jest.fn<any>().mockResolvedValue([
          { key: "platform_name", value: "MED-CARE" },
          { key: "support_email", value: "support@medcare-et.com" },
          { key: "commission_etb_per_delivered_order", value: "10" },
          { key: "delivery_radius_km", value: "15" },
          { key: "maintenance_mode", value: "false" },
        ]),
      });
      (PlatformConfig.findOneAndUpdate as any).mockResolvedValue(true);

      const res = await request(app).patch(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`).send({ platformName: "MED-CARE v2" });
      expect(res.status).toBe(200);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).patch(`${BASE}/`).send({ platformName: "Test" });
      expect(res.status).toBe(401);
    });

    it("updates maintenance mode flag", async () => {
      (PlatformConfig.find as any).mockReturnValue({
        lean: jest.fn<any>().mockResolvedValue([
          { key: "platform.maintenance_mode", value: "false" },
        ]),
      });
      (PlatformConfig.findOneAndUpdate as any).mockResolvedValue(true);
      const res = await request(app).patch(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`).send({ maintenanceMode: true });
      expect(res.status).toBe(200);
    });
  });

  describe("GET / - unauthorized", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });
  });

  describe("Platform Settings - response shape", () => {
    it("response has success flag and data property", async () => {
      (PlatformConfig.find as any).mockReturnValue({
        lean: jest.fn<any>().mockResolvedValue([
          { key: "platform.name", value: "MedCare Platform" },
        ]),
      });
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    });
  });
});
