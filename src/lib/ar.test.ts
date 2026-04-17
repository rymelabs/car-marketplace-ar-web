import { describe, expect, it } from "vitest";
import { getArEligibility, hasValidDimensions, isNormalizedToMeters } from "@/lib/ar";
import type { CarModelAsset } from "@/types/marketplace";

describe("AR utilities", () => {
  it("validates dimension sanity", () => {
    expect(hasValidDimensions({ length: 4.8, width: 2, height: 1.4 })).toBe(true);
    expect(hasValidDimensions({ length: 0, width: 2, height: 1.4 })).toBe(false);
  });

  it("validates normalized scale", () => {
    expect(isNormalizedToMeters(1)).toBe(true);
    expect(isNormalizedToMeters(1.000000001)).toBe(true);
    expect(isNormalizedToMeters(0.9)).toBe(false);
  });

  it("returns AR eligible only when QA and scale checks pass", () => {
    const model: CarModelAsset = {
      id: "m1",
      carId: "c1",
      glbPath: "https://example.com/car.glb",
      usdzPath: "https://example.com/car.usdz",
      dimensionsMeters: {
        length: 4.9,
        width: 2,
        height: 1.4,
      },
      normalizedScale: 1,
      qaStatus: "approved",
      sourceType: "curated",
    };

    expect(getArEligibility(model).eligible).toBe(true);

    expect(
      getArEligibility({
        ...model,
        qaStatus: "pending",
      }).eligible,
    ).toBe(false);

    expect(
      getArEligibility({
        ...model,
        normalizedScale: 0.75,
      }).eligible,
    ).toBe(false);
  });
});
