import request from "supertest";
import { app } from "../src/app.js";

describe("Health endpoint", () => {
  it("returns success payload", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("is a public endpoint — no auth required", async () => {
    const response = await request(app).get("/health");
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });

  it("returns JSON content type", async () => {
    const response = await request(app).get("/health");
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});
