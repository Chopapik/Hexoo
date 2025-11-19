import { adminCreateUserAccount } from "@/features/admin/api/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const result = await adminCreateUserAccount(body);
  return handleSuccess(result);
});
