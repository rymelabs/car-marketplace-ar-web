import { getCarById } from "@/lib/data/repository";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const car = await getCarById(id);

    if (!car) {
      return jsonResponse({ error: "Car not found" }, { status: 404 });
    }

    return jsonResponse({
      car,
      ar: {
        eligible: car.arEligible,
        modelQaStatus: car.modelAsset?.qaStatus ?? "missing",
        dimensionsMeters: car.modelAsset?.dimensionsMeters,
        reason: car.arIneligibleReason,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
