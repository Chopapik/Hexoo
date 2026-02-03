import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import {
  addComment,
  getCommentsByPostId,
} from "@/features/comments/api/services";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const POST = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession();
    const body = await req.json();

    const result = await addComment(session, { ...body, postId: id });

    return handleSuccess(result, 201);
  }
);

export const GET = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession().catch(() => null);
    const comments = await getCommentsByPostId(session, id);
    return handleSuccess(comments);
  }
);
