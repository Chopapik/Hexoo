import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { reportPost } from "@/features/posts/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { ReportPostSchema } from "@/features/posts/types/post.dto";
import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";

export const POST = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession();
    const body = await req.json();

    const parsed = ReportPostSchema.safeParse(body);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[report-post] Invalid input",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { reason, details } = parsed.data;
    const result = await reportPost(session, id, reason, details);

    return handleSuccess(result, 201);
  },
);
