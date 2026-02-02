import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";
import { postService } from "@/features/posts/api/services";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const POST = withErrorHandling(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const session = await getUserFromSession();
    const body = await req.json();

    const { reason, details } = body;

    const result = await postService.reportPost(session, id, reason, details);

    return handleSuccess(result);
  },
);
