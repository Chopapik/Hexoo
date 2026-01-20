import { adminUpdateUserPassword } from "@/features/admin/api/services/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const PUT = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const body = await req.json();
    const { uid } = await context.params;
    const { newPassword } = body;
    const result = await adminUpdateUserPassword(uid, newPassword);
    return handleSuccess({ ok: true, result });
  },
);
