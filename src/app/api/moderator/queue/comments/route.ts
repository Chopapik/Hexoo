import { getModerationQueueForComments } from "@/features/moderator/api/services";

import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { NextRequest } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startAfter = searchParams.get("startAfter") || undefined;

  const comments = await getModerationQueueForComments(
    session,
    limit,
    startAfter,
  );
  return handleSuccess({ comments });
});
