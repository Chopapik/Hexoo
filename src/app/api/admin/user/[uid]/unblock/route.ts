import { unblockUser } from "@/features/admin/api/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const PUT = withErrorHandling(
  async (_req: Request, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const result = await unblockUser(uid);
    return sendSuccess(result);
  }
);
