import { User, UserBlockData } from "@/features/users/types/user.type";

export interface IUserRepository {
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
  blockUser(data: UserBlockData): Promise<void>;
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
