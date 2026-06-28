import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

import { resetDemoData } from "@/features/demo/api/demoReset.service";
import { handleError, handleSuccess } from "@/lib/http/responseHelpers";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { assertDemoResetRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function isAuthorized(req: NextRequest, secret: string): boolean {
  const authorization = req.headers.get("authorization") ?? "";
  return safeEqual(authorization, `Bearer ${secret}`);
}

async function handleDemoReset(req: NextRequest) {
  await assertDemoResetRateLimit(req);

  if (process.env.IS_DEMO !== "true") {
    console.warn("[demoReset] Reset rejected because demo mode is disabled.");
    return handleError(
      "NOT_FOUND",
      "Demo reset endpoint is not available.",
      undefined,
      404,
    );
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[demoReset] Reset rejected because CRON_SECRET is missing.");
    return handleError(
      "INTERNAL_ERROR",
      "Demo reset secret is not configured.",
      undefined,
      500,
    );
  }

  if (!isAuthorized(req, secret)) {
    console.warn("[demoReset] Reset rejected because authorization failed.");
    return handleError(
      "INVALID_CREDENTIALS",
      "Invalid demo reset authorization.",
      undefined,
      401,
    );
  }

  const summary = await resetDemoData();
  return handleSuccess(summary);
}

export const GET = withErrorHandling(async (req: NextRequest) =>
  handleDemoReset(req),
);

export const POST = withErrorHandling(async (req: NextRequest) =>
  handleDemoReset(req),
);
