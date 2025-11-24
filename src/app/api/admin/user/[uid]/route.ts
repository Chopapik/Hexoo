import { adminDeleteUser } from "@/features/admin/api/adminService";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { withErrorHandling } from "@/lib/http/routeWrapper";

export const DELETE = withErrorHandling(
  async (_req: Request, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const result = await adminDeleteUser(uid);
    return handleSuccess(result);
  }
);
