import type { ActivityLogInput } from "@/features/activity/types/activity.type";
import type { AdminActivityLog } from "@/features/activity/api/services/activity.service.interface";
import { ActivityRepository } from "../activity.repository.interface";
import { supabaseAdmin } from "@/lib/supabaseServer";
import maskEmail from "@/features/shared/utils/maskEmail";

const TABLE = "activity_logs";

type ActivityLogRow = {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
};

type ActivityLogUserRow = {
  uid: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

export class SupabaseActivityRepository implements ActivityRepository {
  async logActivity(logData: ActivityLogInput): Promise<void> {
    const { error } = await supabaseAdmin.from(TABLE).insert({
      user_id: logData.userId,
      action: logData.action,
      details: logData.details ?? "",
    });
    if (error) throw error;
  }

  async getAdminActivityLogs(
    limit: number,
    startAfterId?: string,
  ): Promise<AdminActivityLog[]> {
    let query = supabaseAdmin
      .from(TABLE)
      .select("id, user_id, action, details, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (startAfterId) {
      const cursorRow = await supabaseAdmin
        .from(TABLE)
        .select("created_at, id")
        .eq("id", startAfterId)
        .maybeSingle();
      if (cursorRow.data) {
        const { created_at, id } = cursorRow.data as {
          created_at: string;
          id: string;
        };
        query = query.or(
          `created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`,
        );
      }
    }

    const { data: logData, error: logError } = await query;

    if (logError) {
      throw logError;
    }

    const rows = (logData as ActivityLogRow[] | null) ?? [];

    const uniqueUserIds = Array.from(
      new Set(rows.map((row) => row.user_id).filter(Boolean)),
    );

    let usersById: Record<
      string,
      { name: string | null; email: string | null; role: string | null }
    > = {};

    if (uniqueUserIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from("users")
        .select("uid, name, email, role")
        .in("uid", uniqueUserIds);

      if (usersError) {
        throw usersError;
      }

      usersById =
        (usersData as ActivityLogUserRow[] | null)?.reduce(
          (acc, user) => {
            acc[user.uid] = {
              name: user.name,
              email: user.email,
              role: user.role,
            };
            return acc;
          },
          {} as Record<
            string,
            {
              name: string | null;
              email: string | null;
              role: string | null;
            }
          >,
        ) ?? {};
    }

    return rows.map<AdminActivityLog>((row) => {
      const user = usersById[row.user_id];

      return {
        id: row.id,
        userId: row.user_id,
        action: row.action as AdminActivityLog["action"],
        details: row.details ?? "",
        createdAt: row.created_at,
        userName: user?.name ?? null,
        userEmail: user ? maskEmail(user.email ?? "") ?? "" : null,
        userRole: user?.role ?? null,
      };
    });
  }
}

