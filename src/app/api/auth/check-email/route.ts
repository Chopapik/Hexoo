import { checkEmailAvailability } from "@/features/auth/api/services";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { email } = body;

  const result = await checkEmailAvailability(email);
  return handleSuccess(result);
});
