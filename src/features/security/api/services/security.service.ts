import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";
import type { SecurityService as ISecurityService } from "./security.service.interface";

const WINDOW_SIZE_MS = 60 * 1000;
const MAX_REQUESTS = 30;

export class SecurityService implements ISecurityService {
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
