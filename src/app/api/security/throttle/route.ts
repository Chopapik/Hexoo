import { withErrorHandling } from "@/lib/http/routeWrapper";
import { checkThrottle } from "@/features/security/api/services";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    throw new Error("IP is required for throttle check");
  }
  await checkThrottle(ip);

  return handleSuccess({ status: "allowed" });
});
