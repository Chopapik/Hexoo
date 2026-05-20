import type { AdminActivityLog } from "@/features/activity/api/services/activity.service.interface";
import type { ActivityLogInput } from "@/features/activity/types/activity.type";
import type {
  Tables,
  TablesInsert,
} from "@/lib/supabase.database.types";
import maskEmail from "@/features/shared/utils/maskEmail";

type ActivityLogRow = Pick<
  Tables<"activity_logs">,
  "action" | "created_at" | "details" | "id" | "user_id"
>;
type ActivityLogInsertRow = TablesInsert<"activity_logs">;
type ActivityLogUserRow = Pick<
  Tables<"users">,
  "display_name" | "email" | "role" | "uid"
>;

export function toActivityLogInsertRow(
  logData: ActivityLogInput,
): ActivityLogInsertRow {
  return {
    user_id: logData.userId,
    action: logData.action,
    details: logData.details ?? "",
  };
}

export function indexActivityUsersById(
  users: ActivityLogUserRow[],
): Record<string, ActivityLogUserRow> {
  return users.reduce<Record<string, ActivityLogUserRow>>((acc, user) => {
    acc[user.uid] = user;
    return acc;
  }, {});
}

export function mapAdminActivityLog(
  row: ActivityLogRow,
  user: ActivityLogUserRow | undefined,
): AdminActivityLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action as AdminActivityLog["action"],
    details: row.details ?? "",
    createdAt: row.created_at,
    userName: user?.display_name ?? null,
    userEmail: user ? maskEmail(user.email ?? "") ?? "" : null,
    userRole: user?.role ?? null,
  };
}

export type { ActivityLogRow, ActivityLogUserRow };
