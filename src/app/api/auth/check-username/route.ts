import { checkUsernameAvailability } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { assertPublicLookupRateLimit } from "@/lib/rateLimit";

export const POST = withErrorHandling(async (req: NextRequest) => {
  await assertPublicLookupRateLimit(req);

  const body = await req.json();
  const { username } = body;

  const result = await checkUsernameAvailability(username);
  return handleSuccess(result);
});
