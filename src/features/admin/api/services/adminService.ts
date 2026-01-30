import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import maskEmail from "@/features/shared/utils/maskEmail";
import { AdminUserCreate } from "@/features/admin/types/admin.type";
import { createAppError } from "@/lib/AppError";
import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";
import admin from "firebase-admin";
import { logActivity } from "./activityService";

const ensureAdmin = async () => {
  const session = await getUserFromSession();

  if (!session) {
    throw createAppError({
      code: "AUTH_REQUIRED",
      message: "[adminService.ensureAdmin] No session found",
    });
  }

  if (session.role !== "admin") {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[adminService.ensureAdmin] Admin role required",
    });
  }
};

export const adminDeleteUser = async (uid: string) => {
  await ensureAdmin();

  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[adminService.adminDeleteUser] No 'uid' provided for deletion",
    });
  }

  await logActivity(uid, "USER_DELETED", "User account deleted by admin");

  await authRepository.deleteUser(uid);
  await userRepository.deleteUser(uid);

  return { success: true, uid };
};

export const adminCreateUserAccount = async (data: AdminUserCreate) => {
  await ensureAdmin();

  if (!data?.email || !data?.password || !data?.name) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message:
        "[adminService.adminCreateUserAccount] Empty create user credentials",
      data: { code: "admin/empty_create_user_account_credentials" },
    });
  }

  const userRecord = await authRepository.createUser({
    email: data.email,
    password: data.password,
    displayName: data.name,
  });

  const uid = userRecord.uid;

  await userRepository.createUser({
    uid,
    name: data.name,
    email: data.email,
    role: data.role ?? "user",
  });

  await userRepository.updateUser(uid, {} as any);

  await logActivity(uid, "USER_CREATED", "Account created by admin");

  return {
    uid,
    email: maskEmail(data.email),
    displayName: data.name,
    role: data.role ?? "user",
  };
};

export const adminGetAllUsers = async () => {
  await ensureAdmin();

  const users = await userRepository.getAllUsers();

  return users.map((user) => ({
    uid: user.uid,
    name: user.name ?? null,
    email: maskEmail(user.email ?? ""),
    role: user.role ?? "user",
    createdAt: (user.createdAt as any)?.toDate
      ? (user.createdAt as any).toDate()
      : user.createdAt,
    isBanned: Boolean(user.isBanned),
  }));
};

export const adminUpdateUserAccount = async (
  uid: string,
  data: { name?: string; email?: string; role?: string },
) => {
  await ensureAdmin();

  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[adminService.adminUpdateUserAccount] No 'uid' provided",
    });
  }

  const updatePayload: Record<string, any> = {};

  if (data.name?.trim()) updatePayload.name = data.name.trim();
  if (data.role?.trim()) updatePayload.role = data.role.trim();
  if (data.email?.trim()) {
    updatePayload.email = data.email.trim();
    // updatePayload.maskedEmail = maskEmail(data.email.trim()); // If we want to store it.
  }

  await userRepository.updateUser(uid, updatePayload);

  const authUpdate: Record<string, any> = {};
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
      `Profile updated by admin: ${updatedFields.join(", ")}`
    );
  }

  return;
};

export const adminUpdateUserPassword = async (
  uid: string,
  newPassword: string,
) => {
  await ensureAdmin();

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

  await logActivity(uid, "PASSWORD_CHANGED", "Password changed by admin");

  return;
};
