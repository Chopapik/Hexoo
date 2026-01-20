import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getPostsByUserId } from "@/features/posts/api/services/postService";

export const GET = withErrorHandling(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
  ) => {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const startAfter = searchParams.get("startAfter") || undefined;

    const result = await getPostsByUserId(userId, limit, startAfter);
    return handleSuccess(result);
  },
);
