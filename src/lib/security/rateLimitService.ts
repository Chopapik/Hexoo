import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/ApiError";
import admin from "firebase-admin";

const MAX_ANONYMOUS_ATTEMPTS = 20;
const LOCKOUT_DURATION_MINUTES = 100;

export async function checkAndIncrementIpLimit(ip: string) {
  const ipRef = adminDb.collection("ip_rate_limits").doc(ip);
  const snap = await ipRef.get();

  const now = admin.firestore.Timestamp.now().toDate();

  if (snap.exists) {
    const data = snap.data()!;
    const { attempts, lockoutUntil } = data;

    if (lockoutUntil && lockoutUntil.toDate() > now) {
      throw createAppError({
        code: "RATE_LIMIT",
        message: `Ip ${ip} blocked for to manny requests until : ${lockoutUntil
          .toDate()
          .toLocaleTimeString()}`,
        status: 429,
        data: {
          ipBlocked: true,
          lockoutUntil,
          maxAnonymousAttempts: MAX_ANONYMOUS_ATTEMPTS,
        },
      });
    }

    if (attempts >= MAX_ANONYMOUS_ATTEMPTS) {
      const lockoutDate = new Date(
        now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000
      );
      await ipRef.update({
        attempts: attempts + 1,
        lockoutUntil: admin.firestore.Timestamp.fromDate(lockoutDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw createAppError({
        code: "RATE_LIMIT",
        message: `Ip ${ip} blocked for to manny requests until : ${lockoutUntil
          .toDate()
          .toLocaleTimeString()}`,
        status: 429,
        data: {
          ipBlocked: true,
          lockoutUntil,
          maxAnonymousAttempts: MAX_ANONYMOUS_ATTEMPTS,
        },
      });
    }

    await ipRef.update({
      attempts: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await ipRef.set({
      ip,
      attempts: 1,
      lockoutUntil: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

export async function resetIpLimit(ip: string) {
  const ipRef = adminDb.collection("ip_rate_limits").doc(ip);
  await ipRef.set(
    {
      attempts: 0,
      lockoutUntil: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
