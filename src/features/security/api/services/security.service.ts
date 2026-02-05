import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";
import admin from "firebase-admin";
import type { SecurityService as ISecurityService } from "./security.service.interface";

// Configuration constants
const MAX_ANONYMOUS_ATTEMPTS = 10;
const LOCKOUT_DURATION_MINUTES = 10;
const COLLECTION_NAME = "auth_ip_rate_limits";
const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 30;

export class SecurityService implements ISecurityService {
  async checkAndIncrementIpLimit(ip: string) {
    const ipRef = adminDb.collection(COLLECTION_NAME).doc(ip);
    const snap = await ipRef.get();

    const now = admin.firestore.Timestamp.now().toDate();

    if (snap.exists) {
      const data = snap.data()!;
      const { attempts, lockoutUntil } = data;

      if (lockoutUntil) {
        const lockoutTime = lockoutUntil.toDate();

        if (lockoutTime > now) {
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
          await ipRef.update({
            attempts: 1,
            lockoutUntil: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return;
        }
      }

      if (attempts >= MAX_ANONYMOUS_ATTEMPTS) {
        const lockoutDate = new Date();
        lockoutDate.setMinutes(
          lockoutDate.getMinutes() + LOCKOUT_DURATION_MINUTES,
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

  async resetIpLimit(ip: string) {
    const ipRef = adminDb.collection(COLLECTION_NAME).doc(ip);
    await ipRef.set(
      {
        attempts: 0,
        lockoutUntil: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  async checkThrottle(ip: string) {
    const throttleDocRef = adminDb.collection("throttle_limits").doc(ip);

    await adminDb.runTransaction(async (t) => {
      const transactionDoc = await t.get(throttleDocRef);
      const now = Date.now();

      if (!transactionDoc.exists) {
        t.set(throttleDocRef, {
          windowStart: now,
          requestCount: 1,
        });
        return;
      }

      const transactionDocData = transactionDoc.data()!;
      const windowStart = transactionDocData.windowStart;
      const currentCount = transactionDocData.requestCount;
      const timeElapsed = now - windowStart;

      if (timeElapsed > WINDOW_SIZE_MS) {
        t.set(throttleDocRef, {
          windowStart: now,
          requestCount: 1,
        });
        return;
      }

      if (currentCount >= MAX_REQUESTS) {
        const resetTime = windowStart + WINDOW_SIZE_MS;

        throw createAppError({
          code: "RATE_LIMIT",
          status: 429,
          data: {
            ip,
            retryAfter: resetTime,
            limit: MAX_REQUESTS,
          },
        });
      }

      t.update(throttleDocRef, {
        requestCount: currentCount + 1,
      });
    });
  }
}
