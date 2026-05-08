import { getUserProfile } from "@/features/users/api/services";
import { NextRequest } from "next/server";
import { AnyRouteContext, withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: AnyRouteContext<{ uid: string }>) => {
    const { uid } = await params;

    const result = await getUserProfile(uid);

    return handleSuccess(result);
  },
);
