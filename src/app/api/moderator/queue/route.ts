import { getModerationQueue } from "@/features/moderator/api/moderatorService";

import { withErrorHandling } from "@/lib/http/routeWrapper";
import { handleSuccess } from "@/lib/http/responseHelpers";

export const GET = withErrorHandling(async () => {
  const posts = await getModerationQueue();
  return handleSuccess({ posts });
});
