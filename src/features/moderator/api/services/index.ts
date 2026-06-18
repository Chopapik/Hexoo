import type { SessionData } from "@/features/me/me.type";
import { ModeratorService } from "./moderator.service";
import { getModerationService } from "@/features/moderation/api/services";
import { authRepository } from "@/features/auth/api/repositories";
import type { ModeratorBanUserRequestDto as ModeratorBanUserRequest } from "@/features/moderator/types/moderator.dto";

export const getModeratorService = (
  session: SessionData | null,
): ModeratorService => {
  const moderationService = getModerationService();
  return new ModeratorService(
    session,
    moderationService,
    authRepository,
  );
};

export async function getModerationQueueForPosts(
  session: SessionData | null,
  limit?: number,
  startAfterId?: string,
) {
  const service = getModeratorService(session);
  return await service.getModerationQueueForPosts(limit, startAfterId);
}

export async function getModerationQueueForComments(
  session: SessionData | null,
  limit?: number,
  startAfterId?: string,
) {
  const service = getModeratorService(session);
  return await service.getModerationQueueForComments(limit, startAfterId);
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

export async function reviewComment(
  session: SessionData | null,
  commentId: string,
  action: "approve" | "reject" | "quarantine",
  banAuthor: boolean | undefined,
  categories: string[],
  justification: string,
) {
  const service = getModeratorService(session);
  return await service.reviewComment(
    commentId,
    action,
    banAuthor,
    categories,
    justification,
  );
}

export async function blockUser(
  session: SessionData | null,
  data: ModeratorBanUserRequest,
) {
  const service = getModeratorService(session);
  return await service.blockUser(data);
}

export { ModeratorService };
