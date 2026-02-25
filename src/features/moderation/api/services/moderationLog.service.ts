import { SupabaseModerationLogRepository } from "../repositories/moderationLog.supabase.repository";
import type { ModerationLogPayload } from "../repositories/moderationLog.repository.interface";

export type { ModerationLogPayload } from "../repositories/moderationLog.repository.interface";

const moderationLogRepository = new SupabaseModerationLogRepository();

export const logModerationEvent = async (payload: ModerationLogPayload) => {
  try {
    await moderationLogRepository.log(payload);
  } catch (error) {
    console.error("[ModerationLog] Failed to log event:", error);
  }
};

export const getLatestModerationLogForResource = async (
  resourceType: string,
  resourceId: string,
): Promise<ModerationLogPayload | null> => {
  try {
    return await moderationLogRepository.getLatestForResource(
      resourceType,
      resourceId,
    );
  } catch (error) {
    console.error(
      "[ModerationLog] Failed to read latest log for resource:",
      error,
    );
    return null;
  }
};
