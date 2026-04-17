const DRIVE_HOST = "drive.google.com";

function parseDriveFileId(input: string): string | null {
  const byFilePath = input.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (byFilePath?.[1]) {
    return byFilePath[1];
  }

  const byQuery = input.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (byQuery?.[1]) {
    return byQuery[1];
  }

  return null;
}

export function isGoogleDriveUrl(input?: string): boolean {
  if (!input) {
    return false;
  }

  return input.includes(DRIVE_HOST);
}

export function normalizeModelAssetUrl(input?: string): string | undefined {
  const value = input?.trim();
  if (!value) {
    return undefined;
  }

  if (!isGoogleDriveUrl(value)) {
    return value;
  }

  const fileId = parseDriveFileId(value);
  if (!fileId) {
    return value;
  }

  // Convert share links to a direct-download endpoint that model-viewer can request.
  return `https://${DRIVE_HOST}/uc?export=download&id=${fileId}`;
}
