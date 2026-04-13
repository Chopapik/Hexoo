import { unblockUser } from "@/features/moderator/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";

export const PUT = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const session = await getUserFromSession();
    const result = await unblockUser(session, uid);
    return handleSuccess(result);
  },
);
