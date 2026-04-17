import { describe, expect, it } from "vitest";
import {
  createOrUpdateCarSchema,
  inquiryPayloadSchema,
  moderateModelUploadSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("accepts valid inquiry payload", () => {
    const parsed = inquiryPayloadSchema.parse({
      carId: "car-123",
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "I want to schedule a test drive this week.",
      preferredContact: "email",
    });

    expect(parsed.name).toBe("Ada Lovelace");
  });

  it("rejects invalid inquiry email", () => {
    const result = inquiryPayloadSchema.safeParse({
      carId: "car-123",
      name: "Ada",
      email: "not-an-email",
      message: "I want to schedule a test drive this week.",
      preferredContact: "email",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid listing payload", () => {
    const parsed = createOrUpdateCarSchema.parse({
      make: "Tesla",
      model: "Model 3",
      year: 2025,
      trim: "Performance",
      condition: "used",
      priceUSD: 49900,
      mileageMiles: 3200,
      description: "One-owner performance sedan with premium package and enhanced autopilot.",
      status: "draft",
      modelRefId: "model_tesla_3",
      specs: {
        drivetrain: "AWD",
        fuelType: "Electric",
        transmission: "Single-speed",
        horsepower: 510,
        exteriorColor: "Midnight Silver",
        interiorColor: "Black",
      },
      mediaRefs: [
        {
          id: "img-1",
          url: "https://example.com/car.jpg",
          alt: "Tesla Model 3",
        },
      ],
    });

    expect(parsed.model).toBe("Model 3");
  });

  it("enforces moderation actions", () => {
    const accepted = moderateModelUploadSchema.safeParse({ status: "approved" });
    const rejected = moderateModelUploadSchema.safeParse({ status: "invalid" });

    expect(accepted.success).toBe(true);
    expect(rejected.success).toBe(false);
  });
});
