import type { UserProfileResponseDto as UserProfileResponse } from "../../../types/user.dto";
import type { UserRepository } from "../../repositories/user.repository.interface";
import type { UserProfileMapper } from "../user.profile.mapper";

export class GetUserProfileUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly profileMapper: UserProfileMapper,
  ) {}

  async execute(
    uid: string,
  ): Promise<{ user: UserProfileResponse } | null> {
    if (!uid) return null;

    const cleanedUid = uid.trim();
    if (!cleanedUid) return null;

    const userData = await this.repository.getUserByUid(cleanedUid);
    if (!userData || userData.deletedAt) return null;

    return { user: this.profileMapper.toProfileResponse(userData) };
  }
}
