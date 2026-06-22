import { UserService } from "./user.service";
import { userRepository } from "../repositories";
import { UserProfileMapper } from "./user.profile.mapper";
import {
  CreateUserUseCase,
  GetUserByUidUseCase,
  GetUserProfileUseCase,
  TouchLastOnlineUseCase,
  GetUsersByIdsUseCase,
} from "./use-cases";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "../../types/user.type";

const userProfileMapper = new UserProfileMapper();

export const getUserService = (): UserService => {
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserByUidUseCase = new GetUserByUidUseCase(userRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(
    userRepository,
    userProfileMapper,
  );
  const touchLastOnlineUseCase = new TouchLastOnlineUseCase(userRepository);
  const getUsersByIdsUseCase = new GetUsersByIdsUseCase(userRepository);
  return new UserService(
    createUserUseCase,
    getUserByUidUseCase,
    getUserProfileUseCase,
    touchLastOnlineUseCase,
    getUsersByIdsUseCase,
  );
};

export async function createUser(
  uid: string,
  userData: {
    name: string;
    email: string;
    role: UserRole;
  },
) {
  const service = getUserService();
  return await service.createUser(uid, userData);
}

export async function getUserByUid(uid: string): Promise<UserEntity | null> {
  const service = getUserService();
  return await service.getUserByUid(uid);
}

export async function getUserProfile(uid: string) {
  const service = getUserService();
  return await service.getUserProfile(uid);
}

export async function touchLastOnline(
  uid: string,
  minIntervalMs?: number,
): Promise<void> {
  const service = getUserService();
  return await service.touchLastOnline(uid, minIntervalMs);
}

export async function getUsersByIds(
  uids: string[],
): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>> {
  const service = getUserService();
  return await service.getUsersByIds(uids);
}

export { UserService };
