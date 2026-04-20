import { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
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

  /**
   * Creates a placeholder user row for an OAuth user
   * who has not completed username setup yet.
   */
  createOAuthPendingUser(data: { uid: string; email: string }): Promise<void>;

  getUserByUid(uid: string): Promise<UserEntity | null>;

  getUserByName(name: string): Promise<UserEntity | null>;

  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>>;

  blockUser(data: BlockUserPayload): Promise<void>;

  unblockUser(uid: string): Promise<void>;

  updateUserRestriction(data: UpdateUserRestrictionPayload): Promise<void>;

  getAllUsers(): Promise<UserEntity[]>;

  deleteUser(uid: string): Promise<void>;

  updateUser(uid: string, data: UpdateUserPayload): Promise<void>;
}
