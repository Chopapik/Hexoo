export type UserRole = "admin" | "user" | "moderator";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastOnline: Date;
  isActive?: boolean;
  isBanned?: boolean;
}

export interface UserDataUpdate {
  name?: string;
  email?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface UserEmailUpdate {}

export interface UserPasswordUpdate {
  oldPassword: string;
  newPassword: string;
}

export interface UserProfileUpdate {
  name: string;
  avatarUrl?: string;
}

export type UserSessionData = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
};

export interface UserProfile {
  uid: string;
  name: string;
  avatarUrl?: string;
  lastOnline?: Date;
  createdAt: Date;
}
