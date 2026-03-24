import { getModerationQueueForPosts } from "@/features/moderator/api/services";

import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { NextRequest } from "next/server";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const startAfter = searchParams.get("startAfter") || undefined;

  const posts = await getModerationQueueForPosts(session, limit, startAfter);
  return handleSuccess({ posts });
});
