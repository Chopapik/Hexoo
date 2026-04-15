import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { reportComment } from "@/features/comments/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { ReportCommentSchema } from "@/features/comments/types/comment.dto";
import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";

export const POST = withErrorHandling(
  async (
    req: NextRequest,
    context: { params: Promise<{ commentId: string }> },
  ) => {
    const { commentId } = await context.params;
    const session = await getUserFromSession();
    const body = await req.json();

    const parsed = ReportCommentSchema.safeParse(body);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[report-comment] Invalid input",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { reason, details } = parsed.data;
    const result = await reportComment(session, commentId, reason, details);

    return handleSuccess(result, 201);
  },
);
