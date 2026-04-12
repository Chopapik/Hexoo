import {
  CreateUserRequestDto as CreateUserRequest,
  RestrictUserRequestDto as RestrictUserRequest,
  UserProfileResponseDto as UserProfileResponse,
} from "../../types/user.dto";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";

export interface UserService {
  createUser(uid: string, data: CreateUserRequest): Promise<void>;
  getUserByUid(uid: string): Promise<UserEntity | null>;
  getUserProfile(name: string): Promise<{ user: UserProfileResponse } | null>;
  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>>;
  unrestrictUser(uid: string): Promise<void>;
  restrictUser(data: RestrictUserRequest): Promise<void>;
  restrictUserBySystem(uid: string, reason: string): Promise<void>;
}
