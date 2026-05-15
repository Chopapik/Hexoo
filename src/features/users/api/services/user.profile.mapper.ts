import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { UserProfileResponseDto as UserProfileResponse } from "../../types/user.dto";
import type { UserEntity } from "../../types/user.entity";

export class UserProfileMapper {
  toProfileResponse(userData: UserEntity): UserProfileResponse {
    return {
      uid: userData.uid,
      name: userData.name,
      avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
      lastOnline: userData.lastOnline,
      createdAt: userData.createdAt,
    };
  }
}
