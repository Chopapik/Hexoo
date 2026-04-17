import { adminDeleteUser } from "@/features/admin/api/services";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";

export const DELETE = withErrorHandling(
  async (_req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const { uid } = await context.params;
    const session = await getUserFromSession();
    const result = await adminDeleteUser(session, uid);
    return handleSuccess(result);
  },
);
