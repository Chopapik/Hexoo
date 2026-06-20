import { createAppError } from "@/lib/AppError";
import type { SessionData } from "@/features/me/me.type";
import type { LikeRepository } from "../repositories/like.repository.interface";
import type {
  LikeParentCollection,
  SetLikeStateResponseDto,
} from "@/features/likes/types/like.dto";
import type { LikeService as ILikeService } from "./like.service.interface";
import { logActivity } from "@/features/activity/api/services";

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

  async setLikeState(
    parentId: string,
    parentCollection: LikeParentCollection,
    liked: boolean,
  ): Promise<SetLikeStateResponseDto> {
    const user = this.ensureUser();

    if (!parentId?.trim()) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[likeService.setLikeState] Resource ID is missing.",
      });
    }

    const result = await this.repository.setLikeState({
      userId: user.uid,
      parentId,
      parentCollection,
      liked,
    });

    await logActivity(
      user.uid,
      "LIKE_TOGGLED",
      `User set like=${liked} on ${parentCollection} (${parentId})`,
    );

    return result;
  }

  async getLikesForParents(
    userId: string,
    parentCollection: LikeParentCollection,
    parentIds: string[],
  ): Promise<string[]> {
    if (!userId || parentIds.length === 0) return [];
    return await this.repository.getLikesForParents(
      userId,
      parentCollection,
      parentIds,
    );
  }
}
