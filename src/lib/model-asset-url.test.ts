import { describe, expect, it } from "vitest";
import { isGoogleDriveUrl, normalizeModelAssetUrl } from "@/lib/model-asset-url";

describe("model asset URL helpers", () => {
  it("detects google drive URLs", () => {
    expect(
      isGoogleDriveUrl(
        "https://drive.google.com/file/d/1abcDeFGhIJkLmNopQrsTuVWxyZ/view?usp=sharing",
      ),
    ).toBe(true);
    expect(isGoogleDriveUrl("https://example.com/model.glb")).toBe(false);
  });

  it("normalizes google drive share links to direct download URLs", () => {
    const normalized = normalizeModelAssetUrl(
      "https://drive.google.com/file/d/1abcDeFGhIJkLmNopQrsTuVWxyZ/view?usp=sharing",
    );

    expect(normalized).toBe(
      "https://drive.google.com/uc?export=download&id=1abcDeFGhIJkLmNopQrsTuVWxyZ",
    );
  });

  it("keeps non-drive paths unchanged", () => {
    expect(normalizeModelAssetUrl("/models/car_glb.glb")).toBe("/models/car_glb.glb");
  });
});
