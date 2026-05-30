import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/Complaint.js", () => ({
  Complaint: {
    find: jest.fn<any>().mockReturnThis(),
    findOne: jest.fn<any>(),
    findById: jest.fn<any>(),
    countDocuments: jest.fn<any>(),
    sort: jest.fn<any>().mockReturnThis(),
    skip: jest.fn<any>().mockReturnThis(),
    limit: jest.fn<any>().mockReturnThis(),
    lean: jest.fn<any>(),
  },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({
  AuditLog: { create: jest.fn<any>() },
}));

const { Complaint } = await import("../src/models/Complaint.js");
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Complaint routes", () => {
  const BASE = "/api/admin/complaints";
  const adminTok = adminToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /", () => {
    it("lists complaints", async () => {
      (Complaint as any).lean.mockResolvedValue([{ _id: "c1", subject: "Test" }]);
      (Complaint.countDocuments as any).mockResolvedValue(1);
      const res = await request(app)
        .get(`${BASE}/`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:id", () => {
    it("resolves complaint", async () => {
      const mock = {
        _id: "c1",
        status: "open",
        resolution: undefined,
        save: jest.fn<any>().mockResolvedValue({}),
      };
      (Complaint.findOne as any).mockResolvedValue(mock);

      const res = await request(app)
        .patch(`${BASE}/c1`)
        .set("Authorization", `Bearer ${adminTok}`)
        .send({ status: "resolved", resolution: "Fixed" });
      expect(res.status).toBe(200);
      expect(mock.status).toBe("resolved");
    });

    it("returns 404 when complaint does not exist", async () => {
      (Complaint.findOne as any).mockResolvedValue(null);
      const res = await request(app)
        .patch(`${BASE}/nonexistent-id`)
        .set("Authorization", `Bearer ${adminTok}`)
        .send({ status: "resolved", resolution: "N/A" });
      expect(res.status).toBe(404);
    });

    it("returns 401 without auth token", async () => {
      const res = await request(app)
        .patch(`${BASE}/c1`)
        .send({ status: "resolved", resolution: "Fixed" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET / - additional", () => {
    it("returns 401 without auth token", async () => {
      const res = await request(app).get(`${BASE}/`);
      expect(res.status).toBe(401);
    });

    it("filters complaints by status query param", async () => {
      (Complaint as any).lean.mockResolvedValue([{ _id: "c1", subject: "Issue", status: "open" }]);
      (Complaint.countDocuments as any).mockResolvedValue(1);
      const res = await request(app)
        .get(`${BASE}/?status=open`)
        .set("Authorization", `Bearer ${adminTok}`);
      expect(res.status).toBe(200);
    });

    it("response body has data and success fields", async () => {
      (Complaint as any).lean.mockResolvedValue([]);
      (Complaint.countDocuments as any).mockResolvedValue(0);
      const res = await request(app).get(`${BASE}/`).set("Authorization", `Bearer ${adminTok}`);
      expect(res.body).toHaveProperty("data");
      expect(res.body.success).toBe(true);
    });
  });
});
