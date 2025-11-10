import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function createUserDocument(
  uid: string,
  userData: {
    name: string;
    email: string;
    role: string;
  }
) {
  const userDoc = {
    uid,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  adminDb.doc(`users/${uid}`).set(userDoc, { merge: true });
  return userDoc;
}
