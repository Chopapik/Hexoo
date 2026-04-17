import { adminUpdateUserAccount } from "@/features/admin/api/services";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";

export const PUT = withErrorHandling(
  async (req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const session = await getUserFromSession();
    const body = await req.json();
    const { uid } = await context.params;
    const result = await adminUpdateUserAccount(session, uid, body);
    return handleSuccess(result);
  },
);
