import { adminUpdateUserPassword } from "@/features/admin/api/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const PUT = withErrorHandling(
  async (req: Request, context: { params: Promise<{ uid: string }> }) => {
    const body = await req.json();
    const { uid } = await context.params;
    const { newPassword } = body;
    const result = await adminUpdateUserPassword(uid, newPassword);
    return handleSuccess({ ok: true, result });
  }
);
