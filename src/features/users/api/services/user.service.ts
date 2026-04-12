import type { CreateUserRequestDto as CreateUserRequest } from "../../types/user.dto";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import { createAppError } from "@/lib/AppError";
import { logActivity } from "@/features/activity/api/services";
import {
  CreateUserPayload,
  UserRepository,
} from "../repositories/user.repository.interface";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserService as IUserService } from "./user.service.interface";
import { SessionData } from "@/features/me/me.type";
import { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "../../types/user.type";

type CreateUserInput = CreateUserRequest;

export class UserService implements IUserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly session: SessionData | null = null,
    private readonly authRepository: AuthRepository | null = null,
  ) {}

  async createUser(uid: string, data: CreateUserInput) {
    const payload: CreateUserPayload = {
      uid,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    await this.repository.createUser(payload);
  }

  private ensureModeratorOrAdmin = async () => {
    const session = this.session;
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[userService.ensureModeratorOrAdmin] No session available",
      });
    }
    if (session.role !== UserRole.Moderator && session.role !== UserRole.Admin) {
      throw createAppError({
        code: "FORBIDDEN",
        message:
          "[userService.ensureModeratorOrAdmin] Missing moderator/admin role",
      });
    }
    return session;
  };

  async getUserByUid(uid: string): Promise<UserEntity | null> {
    return await this.repository.getUserByUid(uid);
  }

  async getUserProfile(name: string) {
    if (!name) return null;

    const cleaned = name.trim().replace(/\s+/g, "");
    if (!cleaned) return null;

    const userData = await this.repository.getUserByName(cleaned);

    if (!userData) return null;

    const userProfile = {
      uid: userData.uid,
      name: userData.name,
      avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
      lastOnline: userData.lastOnline,
      createdAt: userData.createdAt,
    };

    return { user: userProfile };
  }

  async unrestrictUser(uid: string) {
    await this.ensureModeratorOrAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[userService.unrestrictUser] No 'uid' provided",
      });
    }

    await this.repository.updateUserRestriction({
      uid,
      isRestricted: false,
    });

    await logActivity(uid, "USER_UNRESTRICTED", "User restriction removed");
  }

  private async _applyRestrictionInternal(
    uid: string,
    reason: string,
    source: "ADMIN" | "AI_SYSTEM",
  ) {
    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "UID is required for restriction",
      });
    }

    await this.repository.updateUserRestriction({
      uid,
      isRestricted: true,
      restrictedBy: source,
      restrictedReason: reason,
    });

    await logActivity(
      uid,
      "USER_RESTRICTED",
      `Restricted by ${source}. Reason: ${reason}`,
    );
  }

  async restrictUser(data: { uid: string; reason: string }) {
    await this.ensureModeratorOrAdmin();

    await this._applyRestrictionInternal(data.uid, data.reason, "ADMIN");
  }

  async restrictUserBySystem(uid: string, reason: string) {
    await this._applyRestrictionInternal(uid, reason, "AI_SYSTEM");
  }

  async getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>> {
    if (!uids || uids.length === 0) {
      return {};
    }

    try {
      return await this.repository.getUsersByIds(uids);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw createAppError({
        code: "DB_ERROR",
        message: `[userService.getUsersByIds] Error fetching users by UIDs: ${message}`,
      });
    }
  }
}
