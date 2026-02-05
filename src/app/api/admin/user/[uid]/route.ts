import { adminDeleteUser } from "@/features/admin/api/services";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const DELETE = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const session = await getUserFromSession();
    const result = await adminDeleteUser(session, uid);
    return handleSuccess(result);
  },
);
