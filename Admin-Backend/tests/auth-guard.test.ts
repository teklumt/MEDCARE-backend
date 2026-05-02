import request from "supertest";
import { app } from "../src/app";

describe("Admin auth guard", () => {
  it("blocks protected route without token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe("AUTH_REQUIRED");
  });
});
