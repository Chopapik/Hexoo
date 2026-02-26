import type { SessionData } from "@/features/me/me.type";
import { ModeratorService } from "./moderator.service";
import { ModerationService } from "@/features/moderation/api/services/moderation.service";

export const getModeratorService = (
  session: SessionData | null,
): ModeratorService => {
  const moderationService = new ModerationService();
  return new ModeratorService(session, moderationService);
};

export async function getModerationQueue(session: SessionData | null) {
  const service = getModeratorService(session);
  return await service.getModerationQueue();
}

export async function reviewPost(
  session: SessionData | null,
  postId: string,
  action: "approve" | "reject" | "quarantine",
  banAuthor: boolean | undefined,
  categories: string[],
  justification: string,
) {
  const service = getModeratorService(session);
  return await service.reviewPost(postId, action, banAuthor, categories, justification);
}

export { ModeratorService };
