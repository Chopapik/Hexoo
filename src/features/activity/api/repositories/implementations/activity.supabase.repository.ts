import type { ActivityLogInput } from "@/features/activity/types/activity.type";
import type { AdminActivityLog } from "@/features/activity/api/services/activity.service.interface";
import { ActivityRepository } from "../activity.repository.interface";
import { supabaseAdmin } from "@/lib/supabaseServer";
import {
  applyCursorPagination,
  throwDbError,
} from "@/lib/supabaseRepository";
import {
  indexActivityUsersById,
  mapAdminActivityLog,
  toActivityLogInsertRow,
  type ActivityLogRow,
  type ActivityLogUserRow,
} from "./activity.supabase.mapper";

const TABLE = "activity_logs";

export class SupabaseActivityRepository implements ActivityRepository {
  async logActivity(logData: ActivityLogInput): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .insert(toActivityLogInsertRow(logData));
    throwDbError(error);
  }

  async getAdminActivityLogs(
    limit: number,
    startAfterId?: string,
  ): Promise<AdminActivityLog[]> {
    const query = supabaseAdmin
      .from(TABLE)
      .select("id, user_id, action, details, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    await applyCursorPagination(query, TABLE, startAfterId);

    const { data: logData, error: logError } = await query;
    throwDbError(logError);

    const rows = (logData as ActivityLogRow[] | null) ?? [];

    const uniqueUserIds = Array.from(
      new Set(rows.map((row) => row.user_id).filter(Boolean)),
    );

    let usersById: Record<string, ActivityLogUserRow> = {};

    if (uniqueUserIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from("users")
        .select("uid, display_name, email, role")
        .in("uid", uniqueUserIds);

      throwDbError(usersError);

      usersById = indexActivityUsersById(
        (usersData as ActivityLogUserRow[] | null) ?? [],
      );
    }

    return rows.map((row) => mapAdminActivityLog(row, usersById[row.user_id]));
  }
}
