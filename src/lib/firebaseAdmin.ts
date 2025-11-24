import admin from "firebase-admin";

const initFirebase = () => {
  if (admin.apps.length) return;

  // Check if we have credentials
  if (!process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PROJECT_ID) {
    console.warn(
      "FIREBASE_PRIVATE_KEY or FIREBASE_PROJECT_ID not set. Using mock Firebase Admin."
    );
    // Return early or initialize a mock app if strictly needed,
    // but better to just let the exports be null or mocks if possible.
    // However, existing code might expect adminDb to be a real Firestore instance.
    // If we want to allow the app to start without crashing, we can try to initialize
    // with a valid-looking but fake key if we really need to satisfy the SDK.
    //
    // But a cleaner way is to avoid admin.initializeApp if we can't.
    return;
  }

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
};

initFirebase();

// Helper to provide a safe fallback if admin is not initialized
const getSafeAdminService = (serviceName: "auth" | "firestore" | "storage") => {
  if (admin.apps.length) {
    return admin[serviceName]();
  }
  // Return a proxy that logs warnings or throws errors when used,
  // preventing crash at import time.
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
         // Allow 'collection' to return a dummy object for chaining
        if (serviceName === 'firestore' && prop === 'collection') {
             return () => ({
                 doc: () => ({
                     get: async () => ({ exists: false }),
                     set: async () => {},
                     update: async () => {},
                 }),
                 add: async () => ({ id: 'mock-id' }),
                 orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) }) // minimal chain
             })
        }

        console.warn(
          `Attempted to access firebase-admin.${serviceName}.${String(
            prop
          )} but Firebase is not initialized.`
        );
        return () => {
             console.warn(`Called firebase-admin.${serviceName}.${String(prop)} (mock)`);
             return Promise.resolve(null);
        };
      },
    }
  ) as any;
};

export const adminAuth = getSafeAdminService("auth");
export const adminDb = getSafeAdminService("firestore");
export const adminStorage = getSafeAdminService("storage");
