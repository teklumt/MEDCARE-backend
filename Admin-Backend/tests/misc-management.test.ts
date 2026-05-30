import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/models/DeliveryAssignment.js", () => ({
  DeliveryAssignment: { find: jest.fn<any>().mockReturnThis(), sort: jest.fn<any>().mockReturnThis(), skip: jest.fn<any>().mockReturnThis(), limit: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>(), countDocuments: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Order.js", () => ({
  Order: { find: jest.fn<any>().mockReturnThis(), sort: jest.fn<any>().mockReturnThis(), skip: jest.fn<any>().mockReturnThis(), limit: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>(), countDocuments: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Payment.js", () => ({
  Payment: { find: jest.fn<any>().mockReturnThis(), sort: jest.fn<any>().mockReturnThis(), skip: jest.fn<any>().mockReturnThis(), limit: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>(), countDocuments: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/Driver.js", () => ({
  Driver: { find: jest.fn<any>().mockReturnThis(), sort: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>(), countDocuments: jest.fn<any>() },
}));
jest.unstable_mockModule("../src/models/AuditLog.js", () => ({
  AuditLog: { find: jest.fn<any>().mockReturnThis(), sort: jest.fn<any>().mockReturnThis(), skip: jest.fn<any>().mockReturnThis(), limit: jest.fn<any>().mockReturnThis(), lean: jest.fn<any>(), countDocuments: jest.fn<any>() },
}));

const Order = (await import("../src/models/Order.js")).Order;
const DeliveryAssignment = (await import("../src/models/DeliveryAssignment.js")).DeliveryAssignment;
const Payment = (await import("../src/models/Payment.js")).Payment;
const Driver = (await import("../src/models/Driver.js")).Driver;
const AuditLog = (await import("../src/models/AuditLog.js")).AuditLog;
const { default: request } = await import("supertest");
const { app } = await import("../src/app.js");
const { adminToken } = await import("./helpers.js");

describe("Misc Management routes", () => {
  const adminTok = adminToken();

  beforeEach(() => { jest.clearAllMocks(); });

  it("GET /orders lists orders", async () => {
    (Order as any).lean.mockResolvedValue([{ _id: "o1" }]); (Order.countDocuments as any).mockResolvedValue(1);
    const res = await request(app).get("/api/admin/orders").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /deliveries lists deliveries", async () => {
    (DeliveryAssignment as any).lean.mockResolvedValue([{ _id: "d1" }]); (DeliveryAssignment.countDocuments as any).mockResolvedValue(1);
    const res = await request(app).get("/api/admin/deliveries").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /payments lists payments", async () => {
    (Payment as any).lean.mockResolvedValue([{ _id: "p1" }]); (Payment.countDocuments as any).mockResolvedValue(1);
    const res = await request(app).get("/api/admin/payments").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /drivers lists drivers", async () => {
    (Driver as any).lean.mockResolvedValue([{ _id: "d1" }]); (Driver.countDocuments as any).mockResolvedValue(1);
    const res = await request(app).get("/api/admin/drivers").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /drivers/stats returns stats", async () => {
    (Driver.countDocuments as any).mockResolvedValue(15);
    const res = await request(app).get("/api/admin/drivers/stats").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /audit-logs lists logs", async () => {
    (AuditLog as any).lean.mockResolvedValue([{ _id: "l1" }]); (AuditLog.countDocuments as any).mockResolvedValue(1);
    const res = await request(app).get("/api/admin/audit-logs").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /orders returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/orders");
    expect(res.status).toBe(401);
  });

  it("GET /deliveries returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/deliveries");
    expect(res.status).toBe(401);
  });

  it("GET /payments returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/payments");
    expect(res.status).toBe(401);
  });

  it("GET /drivers returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/drivers");
    expect(res.status).toBe(401);
  });

  it("GET /audit-logs returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/audit-logs");
    expect(res.status).toBe(401);
  });

  it("GET /orders supports status filter", async () => {
    (Order as any).lean.mockResolvedValue([{ _id: "o1", status: "pending" }]);
    (Order.countDocuments as any).mockResolvedValue(1);
    const res = await request(app).get("/api/admin/orders?status=pending").set("Authorization", `Bearer ${adminTok}`);
    expect(res.status).toBe(200);
  });

  it("GET /payments response has data property", async () => {
    (Payment as any).lean.mockResolvedValue([]);
    (Payment.countDocuments as any).mockResolvedValue(0);
    const res = await request(app).get("/api/admin/payments").set("Authorization", `Bearer ${adminTok}`);
    expect(res.body).toHaveProperty("data");
    expect(res.body.success).toBe(true);
  });

  it("GET /drivers/stats returns 401 without auth", async () => {
    const res = await request(app).get("/api/admin/drivers/stats");
    expect(res.status).toBe(401);
  });
});
