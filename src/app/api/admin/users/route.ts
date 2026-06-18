import { adminGetAllUsers } from "@/features/admin/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";

export const GET = withErrorHandling(async () => {
  const session = await getAdminFromSession();
  const users = await adminGetAllUsers(session);
  return handleSuccess({ users });
});
