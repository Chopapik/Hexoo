import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import {
  updateComment,
  deleteComment,
} from "@/features/comments/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";

export const PUT = withErrorHandling(
  async (
    req: NextRequest,
    context: { params: Promise<{ commentId: string }> },
  ) => {
    const { commentId } = await context.params;
    const session = await getUserFromSession();
    const body = await req.json();
    const result = await updateComment(session, commentId, body);
    return handleSuccess(result);
  },
);

export const DELETE = withErrorHandling(
  async (
    _req: NextRequest,
    context: { params: Promise<{ commentId: string }> },
  ) => {
    const { commentId } = await context.params;
    const session = await getUserFromSession();
    await deleteComment(session, commentId);
    return handleSuccess(undefined, 204);
  },
);
