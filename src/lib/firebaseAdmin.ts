import admin from "firebase-admin";

const useEmulators = process.env.USE_FIREBASE_EMULATORS === "true";

// \/if() prevents crash in hot nextjs reloads
if (!admin.apps.length) {
  if (useEmulators) {
    console.log("⚙️ [ADMIN] Start w trybie EMULATORA (bez kluczy prywatnych).");
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: "demo-project.appspot.com",
    });
  } else {
    const REQUIRED_ADMIN_ENVS = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
      "FIREBASE_STORAGE_BUCKET",
    ];

    for (const key of REQUIRED_ADMIN_ENVS) {
      if (!process.env[key]) {
        throw new Error(`⚠️ [ADMIN] Błąd konfiguracji PROD: brakuje ${key}`);
      }
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
