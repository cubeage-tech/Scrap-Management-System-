import request from "supertest";
import app from "../src/app.js";

describe("Scrap Management System API Integration Tests", () => {
  it("GET /api/health - should return HTTP 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "ok");
  });

  it("POST /api/auth/login - should fail with HTTP 400 for invalid email/password format", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "invalid-email-format",
      password: "",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("success", false);
  });

  it("GET /api/category - should fail with HTTP 401 when request is unauthenticated", async () => {
    const res = await request(app).get("/api/category");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("success", false);
  });
});

