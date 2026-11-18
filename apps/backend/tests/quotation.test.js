import request from "supertest";
import app from "../src/app.js";

describe("Marketplace Quotation Module Unit & Integration Tests", () => {
  it("POST /api/marketplace/quotations - should require authentication", async () => {
    const res = await request(app).post("/api/marketplace/quotations").send({
      listingId: "00000000-0000-0000-0000-000000000000",
      pricePerKg: 45,
      quantityKg: 1000
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/marketplace/quotations - should reject invalid GUID listingId when authenticated with dummy header", async () => {
    const res = await request(app)
      .post("/api/marketplace/quotations")
      .set("Authorization", "Bearer invalidtoken")
      .send({
        listingId: "invalid-uuid",
        pricePerKg: 45,
        quantityKg: 1000
      });
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/marketplace/quotations - should reject unauthenticated list requests", async () => {
    const res = await request(app).get("/api/marketplace/quotations");
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

