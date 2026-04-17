import { requireAdminSession } from "@/lib/auth/admin-auth";
import { createOrUpdateCar } from "@/lib/data/repository";
import { errorResponse, jsonResponse } from "@/lib/http";
import { createOrUpdateCarSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);
    const input = createOrUpdateCarSchema.parse(await request.json());
    const car = await createOrUpdateCar(input);

    return jsonResponse({ car }, { status: 201 });
  } catch (error) {
    const status =
      error instanceof Error && error.message.toLowerCase().includes("admin")
        ? 403
        : 500;
    return errorResponse(error, status);
  }
}
