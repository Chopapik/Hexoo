import { blockUser } from "@/features/moderator/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const PUT = withErrorHandling(
  async (req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const { uid } = await context.params;
    const user = await getUserFromSession();
    const { reason } = await req.json();

    const result = await blockUser(user, {
      uidToBlock: uid,
      bannedBy: user.uid,
      bannedReason: reason,
    });

    return handleSuccess(result);
  },
);
