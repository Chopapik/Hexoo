import { adminUpdateUserAccount } from "@/features/admin/api/services/adminService";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const PUT = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const session = await getUserFromSession();
    const body = await req.json();
    const { uid } = await context.params;
    const result = await adminUpdateUserAccount(session, uid, body);
    return handleSuccess(result);
  },
);
