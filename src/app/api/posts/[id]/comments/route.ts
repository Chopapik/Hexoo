import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { addComment } from "@/features/comments/api/commentService";

export const POST = withErrorHandling(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const body = await req.json();

    const result = await addComment({ ...body, postId: id });

    return handleSuccess(result, 201);
  }
);
