import { createAppError } from "@/lib/AppError";
import { activityRepository } from "../repositories";

export type ActivityType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "USER_CREATED"
  | "USER_BLOCKED"
  | "USER_UNBLOCKED"
  | "USER_DELETED"
  | "PASSWORD_CHANGED"
  | "PROFILE_UPDATED"
  | "USER_RESTRICTED"
  | "USER_UNRESTRICTED";

export const logActivity = async (
  userId: string,
  action: ActivityType,
  details: string,
) => {
  try {
    await activityRepository.logActivity({
      userId,
      action,
      details,
    });
  } catch (error) {
    throw createAppError({
      code: "DB_ERROR",
      message: "[ActivityLog] Failed to write log",
      details: error,
    });
  }
};
