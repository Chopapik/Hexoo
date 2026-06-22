import {
  CreateUserRequestDto as CreateUserRequest,
  UserProfileResponseDto as UserProfileResponse,
} from "../../types/user.dto";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";

export interface UserService {
  createUser(uid: string, data: CreateUserRequest): Promise<void>;
  getUserByUid(uid: string): Promise<UserEntity | null>;
  getUserProfile(uid: string): Promise<{ user: UserProfileResponse } | null>;
  touchLastOnline(uid: string, minIntervalMs?: number): Promise<void>;
  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>>;
}
