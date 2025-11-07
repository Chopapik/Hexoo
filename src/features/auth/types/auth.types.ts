import { UserRole } from "@/features/users/types/user.type";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface LoginInputs {
  email: string;
  password: string;
}

export interface RegisterInputs {
  name: string;
  email: string;
  password: string;
}
