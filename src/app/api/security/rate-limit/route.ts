import { withErrorHandling } from "@/lib/http/routeWrapper";
import { checkAndIncrementIpLimit } from "@/features/security/api/bruteForceProtectionService";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.headers.get("x-real-ip") || "unknown";

  await checkAndIncrementIpLimit(ip);

  return handleSuccess({ status: "allowed" });
});
