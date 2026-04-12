import { UserService } from "./user.service";
import { userRepository } from "../repositories";
import { authRepository } from "@/features/auth/api/repositories";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "../../types/user.type";
import type { SessionData } from "@/features/me/me.type";

export const getUserService = (
  session: SessionData | null,
): UserService => {
  return new UserService(userRepository, session, authRepository);
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
): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>> {
  const service = getUserService(null);
  return await service.getUsersByIds(uids);
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
