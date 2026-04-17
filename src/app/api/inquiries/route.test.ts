import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/inquiries/route";

describe("POST /api/inquiries", () => {
  it("creates inquiry for valid car", async () => {
    const request = new Request("http://localhost/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carId: "car_tesla_modely_2024",
        name: "Test Buyer",
        email: "buyer@example.com",
        message: "I want to know if this is still available.",
        preferredContact: "email",
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { inquiryId?: string };

    expect(response.status).toBe(201);
    expect(body.inquiryId).toBeTruthy();
  });

  it("returns 404 when car does not exist", async () => {
    const request = new Request("http://localhost/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carId: "missing-car",
        name: "Test Buyer",
        email: "buyer@example.com",
        message: "I want to know if this is still available.",
        preferredContact: "email",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});
