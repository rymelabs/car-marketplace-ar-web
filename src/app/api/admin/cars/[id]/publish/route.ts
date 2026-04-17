import { requireAdminSession } from "@/lib/auth/admin-auth";
import { setCarPublishStatus } from "@/lib/data/repository";
import { errorResponse, jsonResponse } from "@/lib/http";
import { publishCarSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession(request);
    const { id } = await context.params;
    const { publish } = publishCarSchema.parse(await request.json());

    const car = await setCarPublishStatus(id, publish);
    return jsonResponse({ car });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const status =
      message.includes("admin")
        ? 403
        : message.includes("not found")
          ? 404
          : message.includes("cannot publish")
            ? 422
            : 500;

    return errorResponse(error, status);
  }
}
