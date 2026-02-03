import { createAppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import type { LikeRepository } from "../repositories/like.repository.interface";
import type { LikeParentCollection } from "@/features/likes/types/like.dto";
import type { LikeService as ILikeService } from "./like.service.interface";

export class LikeService implements ILikeService {
  constructor(
    private readonly repository: LikeRepository,
    private readonly session: SessionData | null = null,
  ) {}

  private ensureUser(): SessionData {
    if (!this.session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[likeService] User session required",
      });
    }
    return this.session;
  }

  async toggleLike(
    parentId: string,
    parentCollection: LikeParentCollection,
  ): Promise<void> {
    const user = this.ensureUser();

    if (!parentId?.trim()) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[likeService.toggleLike] Resource ID is missing.",
      });
    }

    await this.repository.toggleLike({
      userId: user.uid,
      parentId,
      parentCollection,
    });
  }

  async getLikesForParents(
    userId: string,
    parentIds: string[],
  ): Promise<string[]> {
    if (!userId || parentIds.length === 0) return [];
    return await this.repository.getLikesForParents(userId, parentIds);
  }
}
