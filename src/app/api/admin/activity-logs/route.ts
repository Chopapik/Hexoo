import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { readPaginationParams } from "@/lib/http/requestParsing";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";
import type { NextRequest } from "next/server";
import { getAdminActivityLogs } from "@/features/activity/api/services";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getAdminFromSession();

  const { limit, startAfter } = readPaginationParams(req.nextUrl.searchParams, {
    defaultLimit: 50,
    maxLimit: 200,
  });

  const logs = await getAdminActivityLogs(session, limit, startAfter);

  return handleSuccess({ logs });
});
