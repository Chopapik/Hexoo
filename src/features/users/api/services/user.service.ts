import type {
  CreateUserRequestDto as CreateUserRequest,
  RestrictUserRequestDto as RestrictUserRequest,
  UserProfileResponseDto as UserProfileResponse,
} from "../../types/user.dto";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { UserService as IUserService } from "./user.service.interface";

import type { CreateUserUseCase } from "./use-cases/create-user.use-case";
import type { GetUserByUidUseCase } from "./use-cases/get-user-by-uid.use-case";
import type { GetUserProfileUseCase } from "./use-cases/get-user-profile.use-case";
import type { TouchLastOnlineUseCase } from "./use-cases/touch-last-online.use-case";
import type { GetUsersByIdsUseCase } from "./use-cases/get-users-by-ids.use-case";
import type { UnrestrictUserUseCase } from "./use-cases/unrestrict-user.use-case";
import type { RestrictUserUseCase } from "./use-cases/restrict-user.use-case";
import type { RestrictUserBySystemUseCase } from "./use-cases/restrict-user-by-system.use-case";

export class UserService implements IUserService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByUidUseCase: GetUserByUidUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly touchLastOnlineUseCase: TouchLastOnlineUseCase,
    private readonly getUsersByIdsUseCase: GetUsersByIdsUseCase,
    private readonly unrestrictUserUseCase: UnrestrictUserUseCase,
    private readonly restrictUserUseCase: RestrictUserUseCase,
    private readonly restrictUserBySystemUseCase: RestrictUserBySystemUseCase,
  ) {}

  async createUser(uid: string, data: CreateUserRequest) {
    return this.createUserUseCase.execute(uid, data);
  }

  async getUserByUid(uid: string): Promise<UserEntity | null> {
    return this.getUserByUidUseCase.execute(uid);
  }

  async getUserProfile(uid: string): Promise<{ user: UserProfileResponse } | null> {
    return this.getUserProfileUseCase.execute(uid);
  }

  async touchLastOnline(uid: string, minIntervalMs?: number): Promise<void> {
    return this.touchLastOnlineUseCase.execute(uid, minIntervalMs);
  }

  async getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>> {
    return this.getUsersByIdsUseCase.execute(uids);
  }

  async unrestrictUser(uid: string): Promise<void> {
    return this.unrestrictUserUseCase.execute(uid);
  }

  async restrictUser(data: RestrictUserRequest): Promise<void> {
    return this.restrictUserUseCase.execute(data);
  }

  async restrictUserBySystem(uid: string, reason: string): Promise<void> {
    return this.restrictUserBySystemUseCase.execute(uid, reason);
  }
}
