import { unblockUser } from "@/features/users/api/userService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const PUT = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const result = await unblockUser(uid);
    return handleSuccess(result);
  }
);
