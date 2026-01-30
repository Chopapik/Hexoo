import {
  BlockUserDto,
  CreateUserDto,
  RestrictUserDto,
  UserProfileDto,
} from "../../types/user.dto";
import type { User } from "../../types/user.entity";

export interface UserService {
  createUserDocument(uid: string, data: CreateUserDto): Promise<any>;
  getUserByUid(uid: string): Promise<User | null>;
  getUserProfile(name: string): Promise<{ user: UserProfileDto } | null>;
  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>>;
  blockUser(data: BlockUserDto): Promise<void>;
  unblockUser(uid: string): Promise<void>;
  unrestrictUser(
    uid: string,
  ): Promise<{ success: boolean; uid: string; status: string }>;
  restrictUser(data: RestrictUserDto): Promise<{
    success: boolean;
    uid: string;
    status: string;
    source: string;
  }>;
  restrictUserBySystem(
    uid: string,
    reason: string,
  ): Promise<{ success: boolean; uid: string; status: string; source: string }>;
}
