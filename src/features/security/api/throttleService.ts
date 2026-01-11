import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";
import admin from "firebase-admin";

const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 30;

export async function checkThrottle(ip: string) {
  const throttleDocRef = adminDb.collection("throttle_limits").doc(ip);

  await adminDb.runTransaction(async (t) => {
    const transactionDoc = await t.get(throttleDocRef);
    const now = Date.now();

    // 1. Initialization: Create a new document for the IP if it doesn't exist
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

    // 2. Window Expiry: Reset the counter and set a new timestamp (Fixed Window Reset)
    if (timeElapsed > WINDOW_SIZE_MS) {
      t.set(throttleDocRef, {
        windowStart: now,
        requestCount: 1,
      });
      return;
    }

    // 3. Limit Validation: Reject the request if MAX_REQUESTS is exceeded within the current window
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

    // 4. Increment: Atomically update the counter within the active window
    t.update(throttleDocRef, {
      requestCount: currentCount + 1,
    });
  });
}
