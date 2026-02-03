import { UserService } from "./user.service";
import { userRepository } from "../repositories";
import type { UserEntity } from "../../types/user.entity";
import type { BlockUserDto } from "../../types/user.dto";
import { UserRole } from "../../types/user.type";
import type { SessionData } from "@/features/me/me.type";

export const getUserService = (
  session: SessionData | null,
): UserService => {
  return new UserService(userRepository, session);
};

export async function createUser(
  uid: string,
  userData: {
    name: string;
    email: string;
    role: UserRole;
  },
) {
  const service = getUserService(null);
  return await service.createUser(uid, userData);
}

export async function getUserByUid(uid: string): Promise<UserEntity | null> {
  const service = getUserService(null);
  return await service.getUserByUid(uid);
}

export async function getUserProfile(name: string) {
  const service = getUserService(null);
  return await service.getUserProfile(name);
}

export async function getUsersByIds(
  uids: string[],
): Promise<Record<string, { name: string; avatarUrl?: string | null }>> {
  const service = getUserService(null);
  return await service.getUsersByIds(uids);
}

export async function blockUser(session: SessionData | null, data: BlockUserDto) {
  const service = getUserService(session);
  return await service.blockUser(data);
}

export async function unblockUser(session: SessionData | null, uid: string) {
  const service = getUserService(session);
  return await service.unblockUser(uid);
}

export async function unrestrictUser(session: SessionData | null, uid: string) {
  const service = getUserService(session);
  return await service.unrestrictUser(uid);
}

export async function restrictUser(
  session: SessionData | null,
  data: { uid: string; reason: string },
) {
  const service = getUserService(session);
  return await service.restrictUser(data);
}

export async function restrictUserBySystem(
  session: SessionData | null,
  uid: string,
  reason: string,
) {
  const service = getUserService(session);
  return await service.restrictUserBySystem(uid, reason);
}

export { UserService };
