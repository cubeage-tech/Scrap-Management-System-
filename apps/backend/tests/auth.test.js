import request from "supertest";
import app from "../src/app.js";

describe("Authentication Module Unit & Integration Tests", () => {
  it("POST /api/auth/register - should fail validation on empty payload", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/register - should fail when email format is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "notanemail",
      password: "password123",
      name: "Test Industry",
      role: "INDUSTRY"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login - should return 400 for bad password format/credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@scrap.com",
      password: "wrongpassword"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

