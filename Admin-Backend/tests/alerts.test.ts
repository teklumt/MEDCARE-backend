import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/HealthAlert.js", () => ({
  HealthAlert: {
    find: jest.fn<any>().mockReturnThis(),
    findByIdAndUpdate: jest.fn<any>(),
    create: jest.fn<any>(),
    countDocuments: jest.fn<any>(),
    sort: jest.fn<any>().mockReturnThis(),
    lean: jest.fn<any>(),
  },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({ AuditLog: { create: jest.fn<any>() } }));

const { HealthAlert } = await import("../src/models/HealthAlert.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Disease Alert routes", () => {
  const BASE = "/api/admin/alerts";
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  describe("POST /", () => {
    it("creates alert", async () => {
      (HealthAlert.create as any).mockResolvedValue({ _id: "a1", type: "Disease Outbreak", message: "Test alert", active: true });
      const res = await request(app).post(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`).send({
        type: "Disease Outbreak", message: "Malaria outbreak reported in AA", region: "AA",
      });
      expect(res.status).toBe(201);
    });

    it("returns 422 on missing message", async () => {
      const res = await request(app).post(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`).send({
        type: "Disease Outbreak", region: "AA",
      });
      expect(res.status).toBe(422);
    });
  });

  describe("GET /", () => {
    it("lists alerts", async () => {
      (HealthAlert as any).lean.mockResolvedValue([{ _id: "a1", type: "Disease Outbreak" }]);
      (HealthAlert.countDocuments as any).mockResolvedValue(1);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:id", () => {
    it("deactivates alert", async () => {
      (HealthAlert.findByIdAndUpdate as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue({ _id: "a1", isActive: false }) });
      const res = await request(app).delete(`${BASE}/a1`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });

    it("returns 404 when alert does not exist", async () => {
      (HealthAlert.findByIdAndUpdate as any).mockReturnValue({ lean: jest.fn<any>().mockResolvedValue(null) });
      const res = await request(app).delete(`${BASE}/nonexistent`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(404);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).delete(`${BASE}/a1`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST / - additional validation", () => {
    it("returns 422 on missing type field", async () => {
      const res = await request(app).post(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`).send({
        message: "Malaria outbreak reported", region: "AA",
      });
      expect(res.status).toBe(422);
    });

    it("returns 422 on missing region field", async () => {
      const res = await request(app).post(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`).send({
        type: "Disease Outbreak", message: "Cholera outbreak reported",
      });
      expect(res.status).toBe(422);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app).post(`${BASE}/`).send({
        type: "Disease Outbreak", message: "Test", region: "AA",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET / - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });

    it("response contains data array and success flag", async () => {
      (HealthAlert as any).lean.mockResolvedValue([]);
      (HealthAlert.countDocuments as any).mockResolvedValue(0);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    });
  });
});
