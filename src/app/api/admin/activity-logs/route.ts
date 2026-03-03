import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import type { NextRequest } from "next/server";
import { getAdminActivityLogs } from "@/features/activity/api/services";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getUserFromSession();

  const searchParams = req.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const startAfter = searchParams.get("startAfter") ?? undefined;

  let limit = 50;

  if (limitParam) {
    const parsed = Number(limitParam);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 200) {
      limit = parsed;
    }
  }

  const logs = await getAdminActivityLogs(session, limit, startAfter);

  return handleSuccess({ logs });
});

