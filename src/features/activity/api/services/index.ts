import { ActivityService } from "./activity.service";
import { activityRepository } from "../repositories";
import type { ActivityType } from "../../types/activity.type";
import type {
  ActivityService as IActivityService,
  AdminActivityLog,
} from "./activity.service.interface";
import type { SessionData } from "@/features/me/me.type";

export const getActivityService = (
  session: SessionData | null,
): IActivityService => {
  return new ActivityService(activityRepository, session);
};

export async function logActivity(
  userId: string,
  action: ActivityType,
  details: string,
): Promise<void> {
  // Logging does not require a session context
  const service = getActivityService(null);
  return await service.logActivity(userId, action, details);
}

export async function getAdminActivityLogs(
  session: SessionData | null,
  limit: number,
  startAfter?: string,
): Promise<AdminActivityLog[]> {
  const service = getActivityService(session);
  return await service.getAdminActivityLogs(limit, startAfter);
}

export type { ActivityType };
export type { IActivityService as ActivityService, AdminActivityLog };
