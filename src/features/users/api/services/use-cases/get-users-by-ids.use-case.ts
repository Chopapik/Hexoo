import { createAppError } from "@/lib/AppError";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { UserRepository } from "../../repositories/user.repository.interface";

export class GetUsersByIdsUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>> {
    if (!uids || uids.length === 0) {
      return {};
    }

    try {
      return await this.repository.getUsersByIds(uids);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw createAppError({
        code: "DB_ERROR",
        message: `[GetUsersByIdsUseCase] Error fetching users by UIDs: ${message}`,
      });
    }
  }
}
