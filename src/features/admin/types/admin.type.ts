import { UserRole } from "@/features/users/types/user.type";

export interface AdminUserCreate {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}
