import { userRepository } from "../repositories";
import type { User, UserBlockData } from "../types/user.type";
import { createAppError } from "@/lib/AppError";
import { ensureModeratorOrAdmin } from "@/features/moderator/api/moderatorService";

export async function createUserDocument(
  uid: string,
  userData: {
    name: string;
    email: string;
    role: string;
  },
) {
  const data = await userRepository.createUser(uid, userData);

  if (!data) {
    throw createAppError({
      code: "DB_ERROR",
      message:
        "[userService.createUserDocument] Missing user data after creation",
    });
  }

  return data;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  return await userRepository.getUserByUid(uid);
}

export async function getUserProfile(name: string) {
  if (!name) return null;

  const cleaned = name.trim().replace(/\s+/g, "");
  if (!cleaned) return null;

  const userData = await userRepository.getUserByName(cleaned);

  if (!userData) return null;

  const userProfile = {
    uid: userData.uid,
    name: userData.name,
    avatarUrl: userData.avatarUrl,
    lastOnline: (userData.lastOnline as any)?.toDate
      ? (userData.lastOnline as any).toDate()
      : userData.lastOnline,
    createdAt: (userData.createdAt as any)?.toDate
      ? (userData.createdAt as any).toDate()
      : userData.createdAt,
  };

  return { user: userProfile };
}

export const blockUser = async (data: UserBlockData) => {
  await ensureModeratorOrAdmin();

  if (!data.uidToBlock) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[userService.blockUser] No 'uidToBlock' provided",
    });
  }

  await userRepository.blockUser(data);
};

export const unblockUser = async (uid: string) => {
  await ensureModeratorOrAdmin();

  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[userService.unblockUser] No 'uid' provided",
    });
  }

  await userRepository.unblockUser(uid);
};

export const unrestrictUser = async (uid: string) => {
  await ensureModeratorOrAdmin();

  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[userService.unrestrictUser] No 'uid' provided",
    });
  }

  await userRepository.updateUserRestriction(uid, false);

  return { success: true, uid, status: "active" };
};

const _applyRestrictionInternal = async (
  uid: string,
  reason: string,
  source: "ADMIN" | "AI_SYSTEM",
) => {
  if (!uid) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "UID is required for restriction",
    });
  }

  await userRepository.updateUserRestriction(uid, true, {
    restrictedBy: source,
    restrictedReason: reason,
  });

  return { success: true, uid, status: "restricted", source };
};

export const restrictUser = async (data: { uid: string; reason: string }) => {
  await ensureModeratorOrAdmin();

  return await _applyRestrictionInternal(data.uid, data.reason, "ADMIN");
};

export const restrictUserBySystem = async (uid: string, reason: string) => {
  console.log(`[AI MODERATION] Restricting user ${uid} due to: ${reason}`);

  return await _applyRestrictionInternal(uid, reason, "AI_SYSTEM");
};

export async function getUsersByIds(
  uids: string[],
): Promise<Record<string, { name: string; avatarUrl?: string | null }>> {
  if (!uids || uids.length === 0) {
    return {};
  }

  try {
    return await userRepository.getUsersByIds(uids);
  } catch (error: any) {
    throw createAppError({
      code: "DB_ERROR",
      message: `[userService.getUsersByIds] Error fetching users by UIDs: ${error.message}`,
    });
  }
}
