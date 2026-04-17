import { requireAdminSession } from "@/lib/auth/admin-auth";
import { listModelUploads } from "@/lib/data/repository";
import { errorResponse, jsonResponse } from "@/lib/http";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam === "approved" ||
      statusParam === "rejected" ||
      statusParam === "pending" ||
      statusParam === "all"
        ? statusParam
        : "pending";

    const uploads = await listModelUploads(status);

    return jsonResponse({ uploads, count: uploads.length });
  } catch (error) {
    const status =
      error instanceof Error && error.message.toLowerCase().includes("admin")
        ? 403
        : 500;
    return errorResponse(error, status);
  }
}
