import type { UpdateProfileData, UpdatePasswordData } from "../../me.type";

export interface MeService {
  deleteAccount(): Promise<void>;
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
