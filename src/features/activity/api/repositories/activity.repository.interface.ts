import type { ActivityLogInput } from "@/features/activity/types/activity.type";
import type { AdminActivityLog } from "@/features/activity/api/services/activity.service.interface";

export interface ActivityRepository {
  logActivity(logData: ActivityLogInput): Promise<void>;

  getAdminActivityLogs(
    limit: number,
    startAfter?: string,
  ): Promise<AdminActivityLog[]>;
}

