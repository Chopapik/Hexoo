import type { ActivityType } from "@/features/activity/types/activity.type";

export interface AdminActivityLog {
  id: string;
  userId: string;
  action: ActivityType;
  details: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
}

export interface ActivityService {
  logActivity(
    userId: string,
    action: ActivityType,
    details: string,
  ): Promise<void>;

  getAdminActivityLogs(
    limit: number,
    startAfter?: string,
  ): Promise<AdminActivityLog[]>;
}

