import { createInquiry, getCarById } from "@/lib/data/repository";
import { errorResponse, jsonResponse } from "@/lib/http";
import { inquiryPayloadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = inquiryPayloadSchema.parse(await request.json());

    const car = await getCarById(payload.carId, { includeDraft: true });
    if (!car) {
      return jsonResponse({ error: "Referenced car listing does not exist." }, { status: 404 });
    }

    const inquiry = await createInquiry(payload);

    return jsonResponse(
      {
        inquiryId: inquiry.id,
        createdAt: inquiry.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
