import { adminDeleteUser } from "@/features/admin/api/services/adminService";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { NextRequest } from "next/server";

export const DELETE = withErrorHandling(
  async (_req: NextRequest, context: { params: Promise<{ uid: string }> }) => {
    const { uid } = await context.params;
    const result = await adminDeleteUser(uid);
    return handleSuccess(result);
  },
);
