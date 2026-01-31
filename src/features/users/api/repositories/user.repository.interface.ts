import { UserEntity } from "../../types/user.entity";
import type {
  BlockUserPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRestrictionPayload,
} from "../../types/user.payload";

export type {
  BlockUserPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRestrictionPayload,
} from "../../types/user.payload";

export interface UserRepository {
  createUser(data: CreateUserPayload): Promise<void>;

  getUserByUid(uid: string): Promise<UserEntity | null>;

  getUserByName(name: string): Promise<UserEntity | null>;

  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>>;

  blockUser(data: BlockUserPayload): Promise<void>;

  unblockUser(uid: string): Promise<void>;

  updateUserRestriction(data: UpdateUserRestrictionPayload): Promise<void>;

  getAllUsers(): Promise<UserEntity[]>;

  deleteUser(uid: string): Promise<void>;

  updateUser(uid: string, data: UpdateUserPayload): Promise<void>;
}
