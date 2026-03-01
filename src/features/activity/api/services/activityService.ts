import { createAppError } from "@/lib/AppError";
import { activityRepository } from "../repositories";
import type { ActivityType } from "../../types/activity.type";

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
