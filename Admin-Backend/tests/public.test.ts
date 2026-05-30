import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/Pharmacy.js", () => ({
  Pharmacy: { find: jest.fn<any>().mockReturnThis(), countDocuments: jest.fn<any>(), sort: jest.fn<any>().mockReturnThis(), select: jest.fn<any>().mockReturnThis(), limit: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>() },
}));

const { Pharmacy } = await import("../src/models/Pharmacy.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");

describe("Public routes", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("GET /api/admin/public/pharmacies", () => {
    it("returns approved pharmacies", async () => {
      (Pharmacy as any).lean.mockResolvedValue([{ _id: "p1" }]);
      (Pharmacy.countDocuments as any).mockResolvedValue(1);

      const res = await request(app).get("/api/admin/public/pharmacies");
      expect(res.status).toBe(200);
    });

    it("returns empty list when no approved pharmacies", async () => {
      (Pharmacy as any).lean.mockResolvedValue([]);
      (Pharmacy.countDocuments as any).mockResolvedValue(0);

      const res = await request(app).get("/api/admin/public/pharmacies");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
    });

    it("does not require authentication", async () => {
      (Pharmacy as any).lean.mockResolvedValue([]);
      (Pharmacy.countDocuments as any).mockResolvedValue(0);

      const res = await request(app).get("/api/admin/public/pharmacies");
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
    });

    it("supports name search via query param", async () => {
      (Pharmacy as any).lean.mockResolvedValue([{ _id: "p1", businessName: "Care Pharmacy" }]);
      (Pharmacy.countDocuments as any).mockResolvedValue(1);

      const res = await request(app).get("/api/admin/public/pharmacies?search=Care");
      expect(res.status).toBe(200);
    });

    it("returns JSON content type", async () => {
      (Pharmacy as any).lean.mockResolvedValue([]);
      (Pharmacy.countDocuments as any).mockResolvedValue(0);

      const res = await request(app).get("/api/admin/public/pharmacies");
      expect(res.headers["content-type"]).toMatch(/json/);
    });
  });
});
