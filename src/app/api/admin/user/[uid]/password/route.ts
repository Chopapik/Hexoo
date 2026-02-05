import { adminUpdateUserPassword } from "@/features/admin/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const PUT = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const session = await getUserFromSession();
    const body = await req.json();
    const { uid } = await context.params;
    const { newPassword } = body;
    const result = await adminUpdateUserPassword(session, uid, newPassword);
    return handleSuccess({ ok: true, result });
  },
);
