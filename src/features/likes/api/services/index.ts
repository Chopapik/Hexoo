import { likeRepository } from "../repositories";
import { LikeService } from "./like.service";
import type { LikeParentCollection } from "@/features/likes/types/like.dto";
import type { SessionData } from "@/features/me/me.type";

export const getLikeService = (
  session: SessionData | null,
): LikeService => {
  return new LikeService(likeRepository, session);
};

export async function toggleLike(
  session: SessionData | null,
  parentId: string,
  parentCollection: LikeParentCollection,
) {
  const service = getLikeService(session);
  return await service.toggleLike(parentId, parentCollection);
}

export async function getLikesForParents(
  session: SessionData | null,
  userId: string,
  parentIds: string[],
) {
  const service = getLikeService(session);
  return await service.getLikesForParents(userId, parentIds);
}

export { LikeService };
