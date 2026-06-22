import type { UpdateProfileData, UpdatePasswordData } from "../../me.type";
import type { AccountDeletionResult } from "./use-cases/process-account-deletion.use-case";

export interface MeService {
  deleteAccount(): Promise<AccountDeletionResult>;
  updateProfile(data: UpdateProfileData): Promise<{
    uid: string;
    email: string;
    role: string;
    name: string;
    avatarUrl?: string;
    isRestricted?: boolean;
    isBanned?: boolean;
  }>;
  updatePassword(passwordData: UpdatePasswordData): Promise<void>;
}
