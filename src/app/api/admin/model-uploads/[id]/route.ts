import { requireAdminSession } from "@/lib/auth/admin-auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { moderateModelUpload } from "@/lib/data/repository";
import { moderateModelUploadSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession(request);
    const { id } = await context.params;
    const payload = moderateModelUploadSchema.parse(await request.json());

    const upload = await moderateModelUpload(id, payload, admin.userId);
    return jsonResponse({ upload });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const status =
      message.includes("admin")
        ? 403
        : message.includes("not found")
          ? 404
          : 500;

    return errorResponse(error, status);
  }
}
