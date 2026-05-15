import { UserService } from "./user.service";
import { userRepository } from "../repositories";
import { UserProfileMapper } from "./user.profile.mapper";
import { UserRestrictionApplier } from "./user.restriction";
import {
  CreateUserUseCase,
  GetUserByUidUseCase,
  GetUserProfileUseCase,
  TouchLastOnlineUseCase,
  GetUsersByIdsUseCase,
  UnrestrictUserUseCase,
  RestrictUserUseCase,
  RestrictUserBySystemUseCase,
} from "./use-cases";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "../../types/user.type";
import type { SessionData } from "@/features/me/me.type";

const userProfileMapper = new UserProfileMapper();
const userRestrictionApplier = new UserRestrictionApplier(userRepository);

export const getUserService = (
  session: SessionData | null,
): UserService => {
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserByUidUseCase = new GetUserByUidUseCase(userRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(
    userRepository,
    userProfileMapper,
  );
  const touchLastOnlineUseCase = new TouchLastOnlineUseCase(userRepository);
  const getUsersByIdsUseCase = new GetUsersByIdsUseCase(userRepository);
  const unrestrictUserUseCase = new UnrestrictUserUseCase(
    userRepository,
    session,
  );
  const restrictUserUseCase = new RestrictUserUseCase(
    userRestrictionApplier,
    session,
  );
  const restrictUserBySystemUseCase = new RestrictUserBySystemUseCase(
    userRestrictionApplier,
  );

  return new UserService(
    createUserUseCase,
    getUserByUidUseCase,
    getUserProfileUseCase,
    touchLastOnlineUseCase,
    getUsersByIdsUseCase,
    unrestrictUserUseCase,
    restrictUserUseCase,
    restrictUserBySystemUseCase,
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
  const service = getUserService(null);
  return await service.createUser(uid, userData);
}

export async function getUserByUid(uid: string): Promise<UserEntity | null> {
  const service = getUserService(null);
  return await service.getUserByUid(uid);
}

export async function getUserProfile(uid: string) {
  const service = getUserService(null);
  return await service.getUserProfile(uid);
}

export async function touchLastOnline(
  uid: string,
  minIntervalMs?: number,
): Promise<void> {
  const service = getUserService(null);
  return await service.touchLastOnline(uid, minIntervalMs);
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
