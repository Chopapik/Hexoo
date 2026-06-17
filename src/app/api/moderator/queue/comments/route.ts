import { getModerationQueueForComments } from "@/features/moderator/api/services";

import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { readPaginationParams } from "@/lib/http/requestParsing";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { NextRequest } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const { limit, startAfter } = readPaginationParams(req.nextUrl.searchParams);

  const comments = await getModerationQueueForComments(
    session,
    limit,
    startAfter,
  );
  return handleSuccess({ comments });
});
