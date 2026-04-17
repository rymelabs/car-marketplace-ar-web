"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { hasFirebaseClientConfig, publicConfig } from "@/lib/config";

let cachedAuth: Auth | null = null;

export function getFirebaseAuthClient(): Auth | null {
  if (!hasFirebaseClientConfig()) {
    return null;
  }

  if (cachedAuth) {
    return cachedAuth;
  }

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: publicConfig.firebaseApiKey,
          authDomain: publicConfig.firebaseAuthDomain,
          projectId: publicConfig.firebaseProjectId,
          storageBucket: publicConfig.firebaseStorageBucket,
          messagingSenderId: publicConfig.firebaseMessagingSenderId,
          appId: publicConfig.firebaseAppId,
        });

  const auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Persistence is optional for environments that block local storage.
  });

  cachedAuth = auth;
  return cachedAuth;
}
