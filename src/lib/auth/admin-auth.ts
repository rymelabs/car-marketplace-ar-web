import { appConfig } from "@/lib/config";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getUserRole } from "@/lib/data/repository";

export interface AdminSession {
  userId: string;
  role: "admin";
}

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAdminSession(request: Request): Promise<AdminSession> {
  if (appConfig.demoAdminBypass) {
    return {
      userId: "demo-admin",
      role: "admin",
    };
  }

  const token = extractBearerToken(request.headers.get("authorization"));

  if (!token) {
    throw new Error("Missing Authorization bearer token.");
  }

  const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
  const role = await getUserRole(decoded.uid);

  if (role !== "admin") {
    throw new Error("Admin access is required for this operation.");
  }

  return {
    userId: decoded.uid,
    role: "admin",
  };
}
