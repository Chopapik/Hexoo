import admin from "firebase-admin";

if (!admin.apps.length) {
  // upewnij się, że projectId jest dostępne globalnie na procesie
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || projectId;

  // jeśli używasz emulatora, ustaw host emulatora STORAGE ZANIM wywołasz admin.storage()
  if (process.env.USE_FIREBASE_EMULATORS === "true") {
    if (process.env.STORAGE_EMULATOR_HOST) {
      process.env.STORAGE_EMULATOR_HOST = process.env.STORAGE_EMULATOR_HOST;
    } else {
      // fallback
      process.env.STORAGE_EMULATOR_HOST = "localhost:9199";
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    projectId: projectId,
    // jawnie ustaw bucket (dobrze mieć to w init)
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  });

  if (process.env.USE_FIREBASE_EMULATORS === "true") {
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      admin.firestore().settings({
        host: process.env.FIRESTORE_EMULATOR_HOST,
        ssl: false,
      });
    }
    // auth emulator - wystarczy mieć env var (zwykle w formie http://localhost:9099)
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST =
        process.env.FIREBASE_AUTH_EMULATOR_HOST;
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage(); // teraz użyje STORAGE_EMULATOR_HOST jeśli ustawione
