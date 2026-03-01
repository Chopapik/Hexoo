import type { ActivityLogInput } from "@/features/activity/types/activity.type";

export interface ActivityRepository {
  logActivity(logData: ActivityLogInput): Promise<void>;
}
