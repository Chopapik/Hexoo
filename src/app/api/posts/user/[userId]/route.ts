import { NextRequest } from "next/server";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { readPaginationParams } from "@/lib/http/requestParsing";
import { getPostsByUserId } from "@/features/posts/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/session-user.service";

export const GET = withErrorHandling(
  async (
    req: NextRequest,
    { params }: AnyRouteContext<{ userId: string }>,
  ) => {
    const { userId } = await params;
    const session = await getUserFromSession().catch(() => null);
    const { limit, startAfter } = readPaginationParams(req.nextUrl.searchParams);

    const result = await getPostsByUserId(session, userId, limit, startAfter);
    return handleSuccess(result);
  },
);
