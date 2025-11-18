import { adminGetAllUsers } from "@/features/admin/api/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const GET = withErrorHandling(async () => {
  const users = await adminGetAllUsers();
  return sendSuccess({ users });
});
