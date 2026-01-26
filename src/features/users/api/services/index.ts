import { UserService } from "./user.service";
import { userRepository } from "../repositories";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import type { User } from "../../types/user.entity";
import type { BlockUserDto } from "../../types/user.dto";

export const getUserService = async (): Promise<UserService> => {
  const session = await getUserFromSession().catch(() => null);
  return new UserService(userRepository, session);
};

export async function createUserDocument(
  uid: string,
  userData: {
    name: string;
    email: string;
    role: string;
  },
) {
  const service = await getUserService();
  return await service.createUserDocument(uid, userData);
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const service = await getUserService();
  return await service.getUserByUid(uid);
}

export async function getUserProfile(name: string) {
  const service = await getUserService();
  return await service.getUserProfile(name);
}

export async function getUsersByIds(
  uids: string[],
): Promise<Record<string, { name: string; avatarUrl?: string | null }>> {
  const service = await getUserService();
  return await service.getUsersByIds(uids);
}

export async function blockUser(data: BlockUserDto) {
  const service = await getUserService();
  return await service.blockUser(data);
}

export async function unblockUser(uid: string) {
  const service = await getUserService();
  return await service.unblockUser(uid);
}

export async function unrestrictUser(uid: string) {
  const service = await getUserService();
  return await service.unrestrictUser(uid);
}

export async function restrictUser(data: { uid: string; reason: string }) {
  const service = await getUserService();
  return await service.restrictUser(data);
}

export async function restrictUserBySystem(uid: string, reason: string) {
  const service = await getUserService();
  return await service.restrictUserBySystem(uid, reason);
}

export { UserService };
export type { User, BlockUserDto };
