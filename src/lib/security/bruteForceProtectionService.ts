import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";
import admin from "firebase-admin";

// Configuration constants
const MAX_ANONYMOUS_ATTEMPTS = 10;
const LOCKOUT_DURATION_MINUTES = 10;
const COLLECTION_NAME = "auth_ip_rate_limits";

/**
 * Protects against Brute Force attacks on login/register.
 */
export async function checkAndIncrementIpLimit(ip: string) {
  const ipRef = adminDb.collection(COLLECTION_NAME).doc(ip);
  const snap = await ipRef.get();

  const now = admin.firestore.Timestamp.now().toDate();

  if (snap.exists) {
    const data = snap.data()!;
    const { attempts, lockoutUntil } = data;

    // 1. Check existing lock
    if (lockoutUntil) {
      const lockoutTime = lockoutUntil.toDate();

      if (lockoutTime > now) {
        // Still blocked -> Throw error
        throw createAppError({
          code: "SECURITY_LOCKOUT",
          status: 429,
          data: {
            ipBlocked: true,
            lockoutUntil,
            maxAnonymousAttempts: MAX_ANONYMOUS_ATTEMPTS,
          },
        });
      } else {
        // Block expired -> Lazy Reset
        await ipRef.update({
          attempts: 1,
          lockoutUntil: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return; // User is clean now
      }
    }

    // 2. Check if limit exceeded
    if (attempts >= MAX_ANONYMOUS_ATTEMPTS) {
      // Apply lock
      const lockoutDate = new Date();
      lockoutDate.setMinutes(
        lockoutDate.getMinutes() + LOCKOUT_DURATION_MINUTES
      );

      await ipRef.update({
        attempts: attempts + 1,
        lockoutUntil: admin.firestore.Timestamp.fromDate(lockoutDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw createAppError({
        code: "SECURITY_LOCKOUT",
        status: 429,
        data: {
          ipBlocked: true,
          lockoutUntil: admin.firestore.Timestamp.fromDate(lockoutDate),
          maxAnonymousAttempts: MAX_ANONYMOUS_ATTEMPTS,
        },
      });
    }

    // 3. Increment attempts
    await ipRef.update({
      attempts: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    // 4. First visit -> Create record
    await ipRef.set({
      ip,
      attempts: 1,
      lockoutUntil: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Manually resets limit (e.g. after successful login)
 */
export async function resetIpLimit(ip: string) {
  const ipRef = adminDb.collection(COLLECTION_NAME).doc(ip);
  await ipRef.set(
    {
      attempts: 0,
      lockoutUntil: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
