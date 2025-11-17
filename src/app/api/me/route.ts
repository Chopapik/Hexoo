import { deleteAccount } from "@/features/me/api/meService";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

export const DELETE = withErrorHandling(async () => {
  await deleteAccount();
  return sendSuccess({ message: "Account deleted" });
});
