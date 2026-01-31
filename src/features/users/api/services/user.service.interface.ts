import {
  BlockUserDto,
  CreateUserDto,
  RestrictUserDto,
  UserProfileDto,
} from "../../types/user.dto";
import type { UserEntity } from "../../types/user.entity";

export interface UserService {
  createUser(uid: string, data: CreateUserDto): Promise<void>;
  getUserByUid(uid: string): Promise<UserEntity | null>;
  getUserProfile(name: string): Promise<{ user: UserProfileDto } | null>;
  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>>;
  blockUser(data: BlockUserDto): Promise<void>;
  unblockUser(uid: string): Promise<void>;
  unrestrictUser(uid: string): Promise<void>;
  restrictUser(data: RestrictUserDto): Promise<void>;
  restrictUserBySystem(uid: string, reason: string): Promise<void>;
}
