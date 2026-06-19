import maskEmail from "@/features/shared/utils/maskEmail";
import { createAppError } from "@/lib/AppError";
import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { AdminUserCreate } from "@/features/admin/types/admin.type";
import type { AdminService as IAdminService } from "./admin.service.interface";
import type { AuthUpdateUserProperties } from "@/features/auth/api/repositories/authRepository.interface";
import type { UpdateUserPayload } from "@/features/users/types/user.payload";
import { UserRole } from "@/features/users/types/user.type";

export class AdminService implements IAdminService {
  constructor(private readonly session: SessionData | null) {}

  private ensureAdmin() {
    if (!this.session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[adminService.ensureAdmin] No session found",
      });
    }

    if (this.session.role !== "admin") {
      throw createAppError({
        code: "FORBIDDEN",
        message: "[adminService.ensureAdmin] Admin role required",
      });
    }
  }

  private parseUserRole(value: unknown): UserRole {
    if (
      value === UserRole.User ||
      value === UserRole.Moderator ||
      value === UserRole.Admin
    ) {
      return value;
    }

    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[adminService.parseUserRole] Invalid user role",
    });
  }

  private activeUnbannedAdmins(users: Awaited<ReturnType<typeof userRepository.getAllUsers>>) {
    return users.filter(
      (user) =>
        user.role === UserRole.Admin &&
        user.isActive !== false &&
        !user.isBanned,
    );
  }

  private async ensureAdminWillRemain(targetUid: string): Promise<void> {
    const admins = this.activeUnbannedAdmins(await userRepository.getAllUsers());
    const remainingAdmins = admins.filter((admin) => admin.uid !== targetUid);

    if (remainingAdmins.length === 0) {
      throw createAppError({
        code: "FORBIDDEN",
        message:
          "[adminService.ensureAdminWillRemain] Cannot remove the last active admin",
      });
    }
  }

  private async ensureTargetAdminCanBeRemoved(targetUid: string): Promise<void> {
    const target = (await userRepository.getAllUsers()).find(
      (user) => user.uid === targetUid,
    );

    if (target?.role === UserRole.Admin) {
      await this.ensureAdminWillRemain(targetUid);
    }
  }

  async adminDeleteUser(uid: string) {
    this.ensureAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message:
          "[adminService.adminDeleteUser] No 'uid' provided for deletion",
      });
    }

    await this.ensureTargetAdminCanBeRemoved(uid);

    await logActivity(uid, "USER_DELETED", "User account deleted by admin");
    await logActivity(
      this.session!.uid,
      "ADMIN_DELETED_USER",
      `Deleted user ${uid}`,
    );

    await authRepository.deleteUser(uid);
    await userRepository.deleteUser(uid);
  }

  async adminCreateUserAccount(data: AdminUserCreate) {
    this.ensureAdmin();

    if (!data?.email || !data?.password || !data?.name) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message:
          "[adminService.adminCreateUserAccount] Empty create user credentials",
        data: { code: "admin/empty_create_user_account_credentials" },
      });
    }

    const role = this.parseUserRole(data.role);

    const userRecord = await authRepository.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    const uid = userRecord.uid;

    try {
      await userRepository.createUser({
        uid,
        name: data.name,
        email: data.email,
        role,
      });
    } catch (error) {
      try {
        await authRepository.deleteUser(uid);
      } catch (compensationError) {
        throw createAppError({
          code: "DB_ERROR",
          message:
            "[adminService.adminCreateUserAccount] Failed to create DB profile and Auth cleanup failed",
          details: { error, compensationError },
          data: { compensation: "FAILED", uid },
        });
      }

      throw createAppError({
        code: "DB_ERROR",
        message:
          "[adminService.adminCreateUserAccount] Failed to create DB profile; Auth user was removed",
        details: error,
        data: { compensation: "AUTH_DELETED", uid },
      });
    }

    await userRepository.updateUser(uid, {});

    await logActivity(uid, "USER_CREATED", "Account created by admin");
    await logActivity(
      this.session!.uid,
      "ADMIN_CREATED_USER",
      `Created user ${uid}`,
    );

    return {
      uid,
      email: maskEmail(data.email) ?? "",
      displayName: data.name,
      role,
    };
  }

  async adminGetAllUsers() {
    this.ensureAdmin();

    const users = await userRepository.getAllUsers();

    return users.map((user) => ({
      uid: user.uid,
      name: user.name ?? null,
      email: maskEmail(user.email ?? "") ?? "",
      role: user.role ?? "user",
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt
          : new Date((user.createdAt as Date | undefined)?.toString?.() ?? 0),
      isBanned: Boolean(user.isBanned),
    }));
  }

  async adminUpdateUserAccount(
    uid: string,
    data: { name?: string; email?: string; role?: string; isActive?: boolean },
  ) {
    this.ensureAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[adminService.adminUpdateUserAccount] No 'uid' provided",
      });
    }

    const updatePayload: UpdateUserPayload = {};

    if (data.name?.trim()) updatePayload.name = data.name.trim();
    if (Object.hasOwn(data, "role")) {
      updatePayload.role = this.parseUserRole(data.role);
    }
    if (data.email?.trim()) {
      updatePayload.email = data.email.trim();
    }

    if (
      updatePayload.role !== undefined &&
      updatePayload.role !== UserRole.Admin
    ) {
      await this.ensureTargetAdminCanBeRemoved(uid);
    }

    if (data.isActive === false) {
      await this.ensureTargetAdminCanBeRemoved(uid);
      updatePayload.isActive = false;
    }

    await userRepository.updateUser(uid, updatePayload);

    const authUpdate: AuthUpdateUserProperties = {};
    if (updatePayload.name) authUpdate.displayName = updatePayload.name;
    if (updatePayload.email) authUpdate.email = updatePayload.email;

    if (Object.keys(authUpdate).length > 0) {
      await authRepository.updateUser(uid, authUpdate);
    }

    const updatedFields = [];
    if (updatePayload.name) updatedFields.push("name");
    if (updatePayload.email) updatedFields.push("email");
    if (updatePayload.role) updatedFields.push("role");

    if (updatedFields.length > 0) {
      await logActivity(
        uid,
        "PROFILE_UPDATED",
        `Profile updated by admin: ${updatedFields.join(", ")}`,
      );
      await logActivity(
        this.session!.uid,
        "ADMIN_UPDATED_USER",
        `Updated user ${uid}: ${updatedFields.join(", ")}`,
      );
    }
  }

  async adminUpdateUserPassword(uid: string, newPassword: string) {
    this.ensureAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[adminService.adminUpdateUserPassword] No 'uid' provided",
      });
    }

    if (!uid || !newPassword || newPassword.length < 8) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message:
          "[adminService.adminUpdateUserPassword] Invalid password provided",
        data: { code: "admin/empty_create_user_account_credentials" },
      });
    }

    await authRepository.updateUser(uid, { password: newPassword });
    await userRepository.updateUser(uid, { sessionInvalidatedAt: new Date() });

    await logActivity(uid, "PASSWORD_CHANGED", "Password changed by admin");
    await logActivity(
      this.session!.uid,
      "ADMIN_CHANGED_PASSWORD",
      `Changed password for user ${uid}`,
    );
  }

  async adminBlockUser(uid: string, reason: string) {
    this.ensureAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[adminService.adminBlockUser] No 'uid' provided",
      });
    }

    if (!reason?.trim()) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[adminService.adminBlockUser] Ban reason is required",
      });
    }

    await this.ensureTargetAdminCanBeRemoved(uid);

    await userRepository.blockUser({
      uidToBlock: uid,
      bannedBy: this.session!.uid,
      bannedReason: reason.trim(),
    });

    await logActivity(uid, "USER_BLOCKED", "User account banned by admin");
    await logActivity(
      this.session!.uid,
      "USER_BLOCKED",
      `Banned user ${uid}`,
    );

    await authRepository.updateUser(uid, { disabled: true });
  }

  async adminUnblockUser(uid: string) {
    this.ensureAdmin();

    if (!uid) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[adminService.adminUnblockUser] No 'uid' provided",
      });
    }

    await userRepository.unblockUser(uid);

    await logActivity(uid, "USER_UNBLOCKED", "User account unbanned by admin");
    await logActivity(
      this.session!.uid,
      "USER_UNBLOCKED",
      `Unbanned user ${uid}`,
    );

    await authRepository.updateUser(uid, { disabled: false });
  }
}
