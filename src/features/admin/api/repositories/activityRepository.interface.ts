import type { ActivityLogInput } from "@/features/admin/types/activity.type";

export interface ActivityRepository {
  logActivity(logData: ActivityLogInput): Promise<void>;
}
