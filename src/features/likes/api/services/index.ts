import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { likeRepository } from "../repositories";
import { LikeService } from "./like.service";
import type { LikeParentCollection } from "@/features/likes/types/like.dto";

export const getLikeService = async (): Promise<LikeService> => {
  const session = await getUserFromSession().catch(() => null);
  return new LikeService(likeRepository, session);
};

export async function toggleLike(
  parentId: string,
  parentCollection: LikeParentCollection,
) {
  const service = await getLikeService();
  return await service.toggleLike(parentId, parentCollection);
}

export async function getLikesForParents(
  userId: string,
  parentIds: string[],
) {
  const service = await getLikeService();
  return await service.getLikesForParents(userId, parentIds);
}

export { LikeService };
