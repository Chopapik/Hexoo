import type { AdminUserCreate } from "@/features/admin/types/admin.type";

export interface AdminService {
  adminDeleteUser(uid: string): Promise<void>;
  adminCreateUserAccount(data: AdminUserCreate): Promise<{
    uid: string;
    email: string;
    displayName: string;
    role: string;
  }>;
  adminGetAllUsers(): Promise<
    {
      uid: string;
      name: string | null;
      email: string;
      role: string;
      createdAt: Date;
      isBanned: boolean;
    }[]
  >;
  adminUpdateUserAccount(
    uid: string,
    data: { name?: string; email?: string; role?: string },
  ): Promise<void>;
  adminUpdateUserPassword(uid: string, newPassword: string): Promise<void>;
}
