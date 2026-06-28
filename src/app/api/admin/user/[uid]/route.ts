import { adminDeleteUser } from "@/features/admin/api/services";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";
import { clearAllAuthCookies } from "@/features/auth/api/utils/session.cookies";
import { assertAdminModeratorRateLimit } from "@/lib/rateLimit";

export const DELETE = withErrorHandling(
  async (_req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const { uid } = await context.params;
    const session = await getAdminFromSession();
    await assertAdminModeratorRateLimit(session.uid);

    const result = await adminDeleteUser(session, uid);
    if (session.uid === uid) await clearAllAuthCookies();
    return handleSuccess(result, result.state === "recovery_pending" ? 202 : 200);
  },
);
