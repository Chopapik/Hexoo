import { withErrorHandling } from "@/lib/http/routeWrapper";
import { checkAndIncrementIpLimit } from "@/lib/security/rateLimitService";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    throw new Error("IP is required for rate limiting check");
  }
  await checkAndIncrementIpLimit(ip);

  return handleSuccess({ status: "allowed" });
});
