import request from "supertest";
import { app } from "../src/app";

describe("Health endpoint", () => {
  it("returns success payload", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });
});
