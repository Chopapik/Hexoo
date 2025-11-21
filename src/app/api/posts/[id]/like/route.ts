import { toggleLike } from "@/features/likes/likeService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const result = await toggleLike(id, "posts");
    return handleSuccess(result);
  }
);
