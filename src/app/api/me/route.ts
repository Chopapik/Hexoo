import { deleteAccount } from "@/features/me/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { clearAllAuthCookies } from "@/features/auth/api/utils/session.cookies";
import { assertSettingsUpdateRateLimit } from "@/lib/rateLimit";

export const DELETE = withErrorHandling(async () => {
  const session = await getUserFromSession();
  await assertSettingsUpdateRateLimit(session.uid);

  const result = await deleteAccount(session);
  await clearAllAuthCookies();
  return handleSuccess(
    { message: "Account deletion accepted", state: result.state },
    result.state === "recovery_pending" ? 202 : 200,
  );
});
