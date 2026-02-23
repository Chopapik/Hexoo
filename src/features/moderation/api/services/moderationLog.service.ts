import { SupabaseModerationLogRepository } from "../repositories/moderationLog.supabase.repository";
import type { ModerationLogEntry } from "../repositories/moderationLog.repository.interface";

export type { ModerationLogEntry } from "../repositories/moderationLog.repository.interface";

const moderationLogRepository = new SupabaseModerationLogRepository();

export const logModerationEvent = async (entry: ModerationLogEntry) => {
  try {
    await moderationLogRepository.log(entry);
  } catch (error) {
    console.error("[ModerationLog] Failed to log event:", error);
  }
};
