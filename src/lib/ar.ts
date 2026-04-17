import type { CarDimensionsMeters, CarModelAsset } from "@/types/marketplace";

export interface ArEligibility {
  eligible: boolean;
  reason?: string;
}

export function hasValidDimensions(dimensions: CarDimensionsMeters): boolean {
  return [dimensions.length, dimensions.width, dimensions.height].every(
    (value) => Number.isFinite(value) && value > 0,
  );
}

export function isNormalizedToMeters(normalizedScale: number): boolean {
  return Number.isFinite(normalizedScale) && Math.abs(normalizedScale - 1) < 1e-6;
}

export function getArEligibility(modelAsset?: CarModelAsset): ArEligibility {
  if (!modelAsset) {
    return { eligible: false, reason: "No 3D model is attached to this listing." };
  }

  if (modelAsset.qaStatus !== "approved") {
    return {
      eligible: false,
      reason: "3D model is not approved for true-scale AR yet.",
    };
  }

  if (!modelAsset.glbPath) {
    return { eligible: false, reason: "Missing GLB asset for AR preview." };
  }

  if (!hasValidDimensions(modelAsset.dimensionsMeters)) {
    return {
      eligible: false,
      reason: "3D model dimensions are incomplete or invalid.",
    };
  }

  if (!isNormalizedToMeters(modelAsset.normalizedScale)) {
    return {
      eligible: false,
      reason: "Model scale is not normalized to 1 unit = 1 meter.",
    };
  }

  return { eligible: true };
}
