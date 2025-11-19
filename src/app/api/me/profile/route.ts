import { updateProfile } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const PUT = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const updated = await updateProfile(body);

  return handleSuccess({ message: "Profile updated", data: updated });
});
