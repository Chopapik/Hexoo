import { updateProfile } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const PUT = withErrorHandling(async (req: Request) => {
  const body = await req.json();

  const updated = await updateProfile(body);

  return sendSuccess({ message: "Profile updated", data: updated });
});
