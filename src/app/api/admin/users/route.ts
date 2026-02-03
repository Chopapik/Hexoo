import { adminGetAllUsers } from "@/features/admin/api/services/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const GET = withErrorHandling(async () => {
  const session = await getUserFromSession();
  const users = await adminGetAllUsers(session);
  return handleSuccess({ users });
});
