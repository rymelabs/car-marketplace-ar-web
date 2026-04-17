import { describe, expect, it } from "vitest";
import {
  makeDriveDirectDownloadUrl,
  normalizeDriveFolderId,
  pickRecommendedDriveModelFiles,
} from "@/lib/google-drive";

describe("google drive helpers", () => {
  it("parses folder id from folder URL", () => {
    const folderId = normalizeDriveFolderId(
      "https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz12345?usp=sharing",
    );

    expect(folderId).toBe("1AbCdEfGhIjKlMnOpQrStUvWxYz12345");
  });

  it("accepts raw folder id", () => {
    const folderId = normalizeDriveFolderId("1AbCdEfGhIjKlMnOpQrStUvWxYz12345");

    expect(folderId).toBe("1AbCdEfGhIjKlMnOpQrStUvWxYz12345");
  });

  it("returns null for invalid folder input", () => {
    expect(normalizeDriveFolderId("abc")).toBeNull();
  });

  it("creates direct download URL", () => {
    expect(makeDriveDirectDownloadUrl("file_123")).toBe(
      "https://drive.google.com/uc?export=download&id=file_123",
    );
  });

  it("picks first alphabetical file recommendation for each model type", () => {
    const recommendation = pickRecommendedDriveModelFiles({
      folderId: "folder_123",
      totalFilesScanned: 4,
      glbFiles: [
        {
          id: "2",
          name: "zeta-model.glb",
          modelType: "glb",
          directUrl: "https://drive.google.com/uc?export=download&id=2",
        },
        {
          id: "1",
          name: "alpha-model.glb",
          modelType: "glb",
          directUrl: "https://drive.google.com/uc?export=download&id=1",
        },
      ],
      usdzFiles: [
        {
          id: "4",
          name: "car_b.usdz",
          modelType: "usdz",
          directUrl: "https://drive.google.com/uc?export=download&id=4",
        },
        {
          id: "3",
          name: "car_a.usdz",
          modelType: "usdz",
          directUrl: "https://drive.google.com/uc?export=download&id=3",
        },
      ],
    });

    expect(recommendation.glbFile?.id).toBe("1");
    expect(recommendation.usdzFile?.id).toBe("3");
  });
});
