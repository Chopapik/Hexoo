import { UserEntity } from "./user.entity";
import { UserRole } from "./user.type";

// Partial User for create, but enforce required core fields.
export type CreateUserPayload = Partial<Omit<UserEntity, "uid">> & {
  // uid from Firebase Auth Client SDK
  uid: string;
  name: string;
  email: string;
  role: UserRole;
};

export type UpdateUserPayload = Partial<Omit<UserEntity, "uid" | "createdAt">>;

export type BlockUserPayload = {
  uidToBlock: string;
  bannedBy: string;
  bannedReason: string;
};

export type UpdateUserRestrictionPayload = {
  uid: string;
  isRestricted: boolean;
  restrictedBy?: string;
  restrictedReason?: string;
};
