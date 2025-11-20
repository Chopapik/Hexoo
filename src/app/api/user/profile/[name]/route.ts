import { getUserProfile } from "@/features/users/api/userService";
import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const GET = withErrorHandling(
  async (req: Request, { params }: { params: { name: string } }) => {
    const { name } = await params;

    const result = await getUserProfile(name);

    return handleSuccess(result);
  }
);
