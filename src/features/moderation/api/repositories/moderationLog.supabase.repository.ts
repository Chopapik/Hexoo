import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  ModerationLogRepository,
  ModerationLogEntry,
} from "./moderationLog.repository.interface";

const TABLE = "moderation_logs";

function entryToRow(entry: ModerationLogEntry): Record<string, unknown> {
  return {
    user_id: entry.userId,
    timestamp: entry.timestamp
      ? entry.timestamp.toISOString()
      : new Date().toISOString(),
    verdict: entry.verdict,
    categories: entry.categories ?? [],
    action_taken: entry.actionTaken,
  };
}

export class SupabaseModerationLogRepository implements ModerationLogRepository {
  async log(entry: ModerationLogEntry): Promise<void> {
    const row = entryToRow(entry);
    const { error } = await supabaseAdmin.from(TABLE).insert(row);
    if (error) {
      throw error;
    }
  }
}
