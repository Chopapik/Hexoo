import { adminBlockUser } from "@/features/admin/api/services";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { createAppError } from "@/lib/AppError";

async function readBlockBody(req: NextRequest): Promise<{ reason: string }> {
  try {
    const body = (await req.json()) as { reason?: unknown };
    if (typeof body.reason === "string" && body.reason.trim()) {
      return { reason: body.reason.trim() };
    }
  } catch {
    // Fall through to controlled validation error below.
  }

  throw createAppError({
    code: "VALIDATION_ERROR",
    message: "[admin block] reason is required",
  });
}

export const PUT = withErrorHandling(
  async (req: NextRequest, context: AnyRouteContext<{ uid: string }>) => {
    const { uid } = await context.params;
    const session = await getAdminFromSession();
    const { reason } = await readBlockBody(req);

    const result = await adminBlockUser(session, uid, reason);

    return handleSuccess(result);
  },
);
