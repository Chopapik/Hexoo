import { reportPost } from "@/features/posts/api/postService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const body = await req.json();

    const result = await reportPost(id, body.reason || "spam");

    return handleSuccess(result);
  }
);
