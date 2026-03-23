import type { SessionData } from "@/features/me/me.type";
import { ModeratorService } from "./moderator.service";
import { ModerationService } from "@/features/moderation/api/services/moderation.service";
import { authRepository } from "@/features/auth/api/repositories";
import type { BlockUserRequestDto as BlockUserRequest } from "@/features/users/types/user.dto";

export const getModeratorService = (
  session: SessionData | null,
): ModeratorService => {
  const moderationService = new ModerationService();
  return new ModeratorService(
    session,
    moderationService,
    authRepository,
  );
};

export async function getModerationQueue(
  session: SessionData | null,
  limit?: number,
  startAfterId?: string,
) {
  const service = getModeratorService(session);
  return await service.getModerationQueue(limit, startAfterId);
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

export async function blockUser(
  session: SessionData | null,
  data: BlockUserRequest,
) {
  const service = getModeratorService(session);
  return await service.blockUser(data);
}

export async function unblockUser(session: SessionData | null, uid: string) {
  const service = getModeratorService(session);
  return await service.unblockUser(uid);
}

export { ModeratorService };
