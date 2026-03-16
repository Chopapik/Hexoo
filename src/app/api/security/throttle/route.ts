import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    throw new Error("IP is required for throttle check");
  }

  // Throttle / rate limiting has been disabled; always allow.
  return handleSuccess({ status: "allowed", ip });
});
