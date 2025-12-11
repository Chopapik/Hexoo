import { reviewPost } from "@/features/moderator/api/moderatorService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { postId, action, banAuthor } = body;

  const result = await reviewPost(postId, action, banAuthor);
  return handleSuccess(result);
});
