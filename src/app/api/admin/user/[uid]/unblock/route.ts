import { adminUnblockUser } from "@/features/admin/api/services";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";
import { assertAdminModeratorRateLimit } from "@/lib/rateLimit";

export const PUT = withErrorHandling(
  async (_req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const { uid } = await context.params;
    const session = await getAdminFromSession();
    await assertAdminModeratorRateLimit(session.uid);

    const result = await adminUnblockUser(session, uid);
    return handleSuccess(result);
  },
);
