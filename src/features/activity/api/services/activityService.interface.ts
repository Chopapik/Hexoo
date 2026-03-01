import type { ActivityType } from "@/features/activity/types/activity.type";

export interface ActivityService {
  logActivity(
    userId: string,
    action: ActivityType,
    details: string,
  ): Promise<void>;
}
