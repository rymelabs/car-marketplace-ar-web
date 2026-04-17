function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

export const appConfig = {
  appName: "Car Marketplace AR",
  demoAdminBypass: parseBoolean(process.env.DEMO_ADMIN_BYPASS, true),
  firebaseAdminProjectId: process.env.FIREBASE_PROJECT_ID,
};

export const publicConfig = {
  demoAdminBypass: parseBoolean(process.env.NEXT_PUBLIC_DEMO_ADMIN_BYPASS, true),
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function hasFirebaseClientConfig(): boolean {
  return Boolean(
    publicConfig.firebaseApiKey &&
      publicConfig.firebaseAuthDomain &&
      publicConfig.firebaseProjectId &&
      publicConfig.firebaseStorageBucket &&
      publicConfig.firebaseMessagingSenderId &&
      publicConfig.firebaseAppId,
  );
}
