import { reviewPost } from "@/features/moderator/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const body = await req.json();
  const { postId, action, banAuthor } = body;

  const result = await reviewPost(session, postId, action, banAuthor);
  return handleSuccess(result);
});
