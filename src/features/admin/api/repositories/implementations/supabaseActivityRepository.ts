import type { ActivityLogInput } from "@/features/admin/types/activity.type";
import { ActivityRepository } from "../activityRepository.interface";
import { supabaseAdmin } from "@/lib/supabaseServer";

const TABLE = "activity_logs";

export class SupabaseActivityRepository implements ActivityRepository {
  async logActivity(logData: ActivityLogInput): Promise<void> {
    const { error } = await supabaseAdmin.from(TABLE).insert({
      user_id: logData.userId,
      action: logData.action,
      details: logData.details ?? "",
    });
    if (error) throw error;
  }
}
