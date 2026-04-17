import { requireAdminSession } from "@/lib/auth/admin-auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import {
  listDriveFolderModelAssets,
  pickRecommendedDriveModelFiles,
} from "@/lib/google-drive";

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");

    if (!folder?.trim()) {
      return jsonResponse(
        {
          error: "Missing required query parameter: folder",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!apiKey?.trim()) {
      return jsonResponse(
        {
          error:
            "Google Drive API is not configured. Set GOOGLE_DRIVE_API_KEY in your server environment.",
        },
        { status: 503 },
      );
    }

    const assets = await listDriveFolderModelAssets(folder, apiKey);
    const recommended = pickRecommendedDriveModelFiles(assets);

    return jsonResponse({
      folderId: assets.folderId,
      totalFilesScanned: assets.totalFilesScanned,
      glbFiles: assets.glbFiles,
      usdzFiles: assets.usdzFiles,
      recommended,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const status = message.includes("admin")
      ? 403
      : message.includes("invalid google drive folder")
        ? 400
        : 500;

    return errorResponse(error, status);
  }
}
