import { logoutUser } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { assertAuthSessionRateLimit } from "@/lib/rateLimit";

export const POST = withErrorHandling(async (req: NextRequest) => {
  await assertAuthSessionRateLimit(req);

  const result = await logoutUser();
  return handleSuccess(result);
});
