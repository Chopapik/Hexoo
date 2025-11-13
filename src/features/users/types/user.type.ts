export type UserRole = "admin" | "user" | "moderator";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: Date;
  lastOnline?: Date;
  isActive?: boolean;
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

export interface UserSessionData {
  uid: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}
