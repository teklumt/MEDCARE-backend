import request from "supertest";
import { app } from "../src/app.js";

describe("Admin auth guard", () => {
  it("blocks protected route without token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("AUTH_REQUIRED");
  });

  it("blocks with a malformed bearer token", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer not.a.valid.jwt");
    expect(response.status).toBe(401);
  });

  it("blocks with non-bearer authorization scheme", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Basic dXNlcjpwYXNz");
    expect(response.status).toBe(401);
  });

  it("blocks access to analytics without token", async () => {
    const response = await request(app).get("/api/admin/analytics/overview");
    expect(response.status).toBe(401);
  });

  it("blocks access to dashboard stats without token", async () => {
    const response = await request(app).get("/api/admin/stats");
    expect(response.status).toBe(401);
  });
});
