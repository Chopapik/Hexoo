import { blockUser } from "@/features/admin/api/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const PUT = withErrorHandling(
  async (_req: Request, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const result = await blockUser(uid);
    return handleSuccess(result);
  }
);
