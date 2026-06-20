import { likeRepository } from "../repositories";
import { LikeService } from "./like.service";
import type { LikeParentCollection } from "@/features/likes/types/like.dto";
import type { SessionData } from "@/features/me/me.type";

export const getLikeService = (
  session: SessionData | null,
): LikeService => {
  return new LikeService(likeRepository, session);
};

export async function setLikeState(
  session: SessionData | null,
  parentId: string,
  parentCollection: LikeParentCollection,
  liked: boolean,
) {
  const service = getLikeService(session);
  return await service.setLikeState(parentId, parentCollection, liked);
}

export async function getLikesForParents(
  session: SessionData | null,
  userId: string,
  parentCollection: LikeParentCollection,
  parentIds: string[],
) {
  const service = getLikeService(session);
  return await service.getLikesForParents(userId, parentCollection, parentIds);
}

export { LikeService };
