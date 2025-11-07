export type UserRole = "admin" | "user" | "moderator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: Date;
  lastOnline?: Date;
  isActive?: boolean;
}

export interface UserProfile {
  name: string;
  joinedAt: Date;
  lastOnline: Date;
  postsCount: number;
  avatarUrl: string;
}

export interface UserDataUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface UserPasswordUpdate {
  oldPassword: string;
  newPassword: string;
}
