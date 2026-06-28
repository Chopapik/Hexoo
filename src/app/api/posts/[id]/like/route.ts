import { setLikeState } from "@/features/likes/api/services";
import { SetLikeStateSchema } from "@/features/likes/types/like.dto";
import { createAppError } from "@/lib/AppError";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { assertLikeRateLimit } from "@/lib/rateLimit";

export const POST = withErrorHandling(
  async (req: NextRequest, context: AnyRouteContext<{ id: string }>) => {
    const { id } = await context.params;
    const session = await getUserFromSession();
    await assertLikeRateLimit(session.uid);

    const body = await req.json().catch(() => null);
    const parsed = SetLikeStateSchema.safeParse(body);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid like target state",
      });
    }
    const result = await setLikeState(session, id, "posts", parsed.data.liked);
    return handleSuccess(result);
  },
);
