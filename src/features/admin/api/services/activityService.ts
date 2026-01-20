import { activityRepository } from "../repositories";

export type ActivityType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "USER_CREATED"
  | "USER_BLOCKED"
  | "USER_UNBLOCKED"
  | "USER_DELETED"
  | "PASSWORD_CHANGED"
  | "PROFILE_UPDATED";

export const logActivity = async (
  userId: string,
  action: ActivityType,
  details: string,
  ip: string = "unknown",
) => {
  try {
    await activityRepository.logActivity({
      userId,
      action,
      details,
      ip,
    });
  } catch (error) {
    console.error("[ActivityLog] Failed to write log:", error);
  }
};
