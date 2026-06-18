import { blockUser } from "@/features/moderator/api/services";
import {
  ModeratorBanUserSchema,
  type ModeratorBanUserRequestDto,
} from "@/features/moderator/types/moderator.dto";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";
import { createAppError } from "@/lib/AppError";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { formatZodErrorFlat } from "@/lib/zod";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(
  async (req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const session = await getUserFromSession();
    const { uid } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = ModeratorBanUserSchema.safeParse(body);

    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[moderator ban] Invalid input",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const payload: ModeratorBanUserRequestDto = {
      ...parsed.data,
      uidToBlock: uid,
    };

    const result = await blockUser(session, payload);

    return handleSuccess(result);
  },
);
