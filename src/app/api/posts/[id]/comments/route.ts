import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import {
  addComment,
  getCommentsByPostId,
} from "@/features/comments/api/commentService";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const body = await req.json();

    const result = await addComment({ ...body, postId: id });

    return handleSuccess(result, 201);
  }
);

export const GET = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const comments = await getCommentsByPostId(id);
    return handleSuccess(comments);
  }
);
