import type { SessionData } from "@/features/me/me.type";
import { ModeratorService } from "./moderator.service";

export const getModeratorService = (
  session: SessionData | null,
): ModeratorService => {
  return new ModeratorService(session);
};

export async function getModerationQueue(session: SessionData | null) {
  const service = getModeratorService(session);
  return await service.getModerationQueue();
}

export async function reviewPost(
  session: SessionData | null,
  postId: string,
  action: "approve" | "reject" | "quarantine",
  banAuthor?: boolean,
) {
  const service = getModeratorService(session);
  return await service.reviewPost(postId, action, banAuthor);
}

export { ModeratorService };
