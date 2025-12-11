import {
  adminCreateUserAccount,
  adminDeleteUser,
} from "@/features/admin/api/adminService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const result = await adminCreateUserAccount(body);
  return handleSuccess(result);
});
