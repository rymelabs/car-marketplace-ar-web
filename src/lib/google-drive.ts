const DRIVE_HOST = "drive.google.com";
const GOOGLE_DRIVE_FILES_API = "https://www.googleapis.com/drive/v3/files";

type DriveModelType = "glb" | "usdz";

interface GoogleDriveFileApiItem {
  id: string;
  name: string;
  mimeType?: string;
}

interface GoogleDriveFilesApiResponse {
  files?: GoogleDriveFileApiItem[];
  error?: {
    code?: number;
    message?: string;
  };
}

export interface DriveModelFile {
  id: string;
  name: string;
  mimeType?: string;
  modelType: DriveModelType;
  directUrl: string;
}

export interface DriveFolderModelAssets {
  folderId: string;
  glbFiles: DriveModelFile[];
  usdzFiles: DriveModelFile[];
  totalFilesScanned: number;
}

interface DriveModelRecommendations {
  glbFile?: DriveModelFile;
  usdzFile?: DriveModelFile;
}

function parseDriveFolderId(input: string): string | null {
  const byPath = input.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (byPath?.[1]) {
    return byPath[1];
  }

  const byQuery = input.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (byQuery?.[1]) {
    return byQuery[1];
  }

  return null;
}

function parseModelType(name: string, mimeType?: string): DriveModelType | null {
  const lower = name.trim().toLowerCase();

  if (lower.endsWith(".glb") || mimeType === "model/gltf-binary") {
    return "glb";
  }

  if (
    lower.endsWith(".usdz") ||
    mimeType === "model/vnd.usdz+zip" ||
    mimeType === "model/usd"
  ) {
    return "usdz";
  }

  return null;
}

export function normalizeDriveFolderId(input?: string): string | null {
  const value = input?.trim();
  if (!value) {
    return null;
  }

  if (value.includes(DRIVE_HOST)) {
    return parseDriveFolderId(value);
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(value)) {
    return value;
  }

  return null;
}

export function makeDriveDirectDownloadUrl(fileId: string): string {
  return `https://${DRIVE_HOST}/uc?export=download&id=${fileId}`;
}

export function pickRecommendedDriveModelFiles(
  assets: DriveFolderModelAssets,
): DriveModelRecommendations {
  const byName = (a: DriveModelFile, b: DriveModelFile) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  const glbFile = [...assets.glbFiles].sort(byName)[0];
  const usdzFile = [...assets.usdzFiles].sort(byName)[0];

  return {
    glbFile,
    usdzFile,
  };
}

export async function listDriveFolderModelAssets(
  folderInput: string,
  apiKey: string,
): Promise<DriveFolderModelAssets> {
  const folderId = normalizeDriveFolderId(folderInput);
  if (!folderId) {
    throw new Error(
      "Invalid Google Drive folder. Provide a valid folder URL or folder ID.",
    );
  }

  if (!apiKey.trim()) {
    throw new Error("Google Drive API key is missing.");
  }

  const query = `'${folderId}' in parents and trashed = false`;
  const params = new URLSearchParams({
    q: query,
    fields: "files(id,name,mimeType)",
    includeItemsFromAllDrives: "true",
    supportsAllDrives: "true",
    pageSize: "200",
    key: apiKey.trim(),
  });

  const response = await fetch(`${GOOGLE_DRIVE_FILES_API}?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const body = (await response.json()) as GoogleDriveFilesApiResponse;

  if (!response.ok) {
    const message = body.error?.message ?? "Unable to query Google Drive folder.";
    throw new Error(message);
  }

  const files = body.files ?? [];

  const modelFiles: DriveModelFile[] = [];

  for (const file of files) {
    const modelType = parseModelType(file.name, file.mimeType);
    if (!modelType) {
      continue;
    }

    modelFiles.push({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modelType,
      directUrl: makeDriveDirectDownloadUrl(file.id),
    });
  }

  return {
    folderId,
    glbFiles: modelFiles.filter((file) => file.modelType === "glb"),
    usdzFiles: modelFiles.filter((file) => file.modelType === "usdz"),
    totalFilesScanned: files.length,
  };
}
