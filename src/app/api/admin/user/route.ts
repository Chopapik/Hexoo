import { adminCreateUserAccount } from "@/features/admin/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";
import { assertAdminModeratorRateLimit } from "@/lib/rateLimit";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getAdminFromSession();
  await assertAdminModeratorRateLimit(session.uid);

  const body = await req.json();
  const result = await adminCreateUserAccount(session, body);
  return handleSuccess(result, 201);
});
