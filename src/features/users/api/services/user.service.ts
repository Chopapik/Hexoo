import type { BlockUserDto, CreateUserDto } from "../../types/user.dto";
import { createAppError } from "@/lib/AppError";
import { logActivity } from "@/features/admin/api/services/activityService";
import {
  CreateUserPayload,
  UserRepository,
} from "../repositories/user.repository.interface";
import type { UserService as IUserService } from "./user.service.interface";
import { SessionData } from "@/features/me/me.type";
import { UserEntity } from "../../types/user.entity";

export class UserService implements IUserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly session: SessionData | null = null,
  ) {}

  async createUser(uid: string, data: CreateUserDto) {
    const payload: CreateUserPayload = {
      uid,
      name: data.name,
      email: data.email,
      role: data.role,
    };
    const newUser = await this.repository.createUser(payload);

    if (!data) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[userService.createUser] Missing user data after creation",
      });
    }
  }

  private ensureModeratorOrAdmin = async () => {
    const session = this.session;
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message:
          "[moderatorService.ensureModeratorOrAdmin] No session available",
      });
    }
    if (session.role !== "moderator" && session.role !== "admin") {
      throw createAppError({
        code: "FORBIDDEN",
        message:
          "[moderatorService.ensureModeratorOrAdmin] Missing moderator/admin role",
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
      avatarUrl: userData.avatarUrl,
      lastOnline: userData.lastOnline,
      createdAt: userData.createdAt,
    };

    return { user: userProfile };
  }

  async blockUser(data: BlockUserDto) {
    await this.ensureModeratorOrAdmin();

    if (!data.uidToBlock) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[userService.blockUser] No 'uidToBlock' provided",
      });
    }

    await this.repository.blockUser(data);

    await logActivity(
      data.uidToBlock,
      "USER_BLOCKED",
      `Blocked by ${data.bannedBy}. Reason: ${data.bannedReason}`,
    );
  }

  async unblockUser(uid: string) {
    await this.ensureModeratorOrAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[userService.unblockUser] No 'uid' provided",
      });
    }

    await this.repository.unblockUser(uid);

    await logActivity(uid, "USER_UNBLOCKED", "User account unblocked");
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
    console.log(`[AI MODERATION] Restricting user ${uid} due to: ${reason}`);

    await this._applyRestrictionInternal(uid, reason, "AI_SYSTEM");
  }

  async getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>> {
    if (!uids || uids.length === 0) {
      return {};
    }

    try {
      return await this.repository.getUsersByIds(uids);
    } catch (error: any) {
      throw createAppError({
        code: "DB_ERROR",
        message: `[userService.getUsersByIds] Error fetching users by UIDs: ${error.message}`,
      });
    }
  }
}
