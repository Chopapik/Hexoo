import { User } from "../../types/user.entity";
import { BlockUserDto } from "../../types/user.dto";

export type CreateUserDBInput = Partial<Omit<User, "uid">> & {
  uid: string;
  name: string;
  email: string;
  role: string;
};

export type UpdateUserDBInput = Partial<
  Omit<User, "uid" | "createdAt">
>;

export type BlockUserDBInput = BlockUserDto;

export interface UserRepository {
  createUser(
    uid: string,
    data: {
      name: string;
      email: string;
      role: string;
    },
  ): Promise<any>;

  getUserByUid(uid: string): Promise<User | null>;

  getUserByName(name: string): Promise<User | null>;

  getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>>;

  blockUser(data: BlockUserDBInput): Promise<void>;

  unblockUser(uid: string): Promise<void>;

  updateUserRestriction(
    uid: string,
    isRestricted: boolean,
    metadata?: { restrictedBy?: string; restrictedReason?: string },
  ): Promise<void>;

  getAllUsers(): Promise<User[]>;

  deleteUser(uid: string): Promise<void>;

  updateUser(uid: string, data: Partial<User>): Promise<void>;
}
