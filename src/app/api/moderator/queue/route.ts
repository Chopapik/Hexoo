import { getModerationQueue } from "@/features/moderator/api/services";

import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export const GET = withErrorHandling(async () => {
  const session = await getUserFromSession();
  const posts = await getModerationQueue(session);
  return handleSuccess({ posts });
});
