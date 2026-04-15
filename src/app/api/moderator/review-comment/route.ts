import { reviewComment } from "@/features/moderator/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { ReviewCommentSchema } from "@/features/moderator/types/moderator.dto";
import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();
  const body = await req.json();

  const parsed = ReviewCommentSchema.safeParse(body);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[review-comment] Invalid input",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const { commentId, action, banAuthor, categories, justification } =
    parsed.data;

  const result = await reviewComment(
    session,
    commentId,
    action,
    banAuthor,
    categories,
    justification,
  );
  return handleSuccess(result);
});
