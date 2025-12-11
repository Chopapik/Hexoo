import { updateProfile } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { NextRequest } from "next/server";

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();

  const updated = await updateProfile(body);

  return handleSuccess({ message: "Profile updated", data: updated });
});
