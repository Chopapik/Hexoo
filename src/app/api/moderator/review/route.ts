import { reviewPost } from "@/features/moderator/api/moderatorService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const { postId, action, banAuthor } = body;

  const result = await reviewPost(postId, action, banAuthor);
  return handleSuccess(result);
});
