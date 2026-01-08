import { blockUser } from "@/features/users/api/userService";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const PUT = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const user = await getUserFromSession();
    const { reason } = await req.json();

    const result = await blockUser({
      uidToBlock: uid,
      bannedBy: user.uid,
      bannedReason: reason,
    });
    return handleSuccess(result);
  }
);
