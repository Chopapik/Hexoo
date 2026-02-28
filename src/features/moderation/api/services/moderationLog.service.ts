import { createAppError } from "@/lib/AppError";
import { SupabaseModerationLogRepository } from "../repositories/moderationLog.supabase.repository";
import type { ModerationLogPayload } from "../repositories/moderationLog.repository.interface";

export type { ModerationLogPayload } from "../repositories/moderationLog.repository.interface";

const moderationLogRepository = new SupabaseModerationLogRepository();

export const logModerationEvent = async (payload: ModerationLogPayload) => {
  try {
    await moderationLogRepository.log(payload);
  } catch (error) {
    throw createAppError({
      code: "DB_ERROR",
      message: "[ModerationLog] Failed to log event",
      details: error,
    });
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
    throw createAppError({
      code: "DB_ERROR",
      message: "[ModerationLog] Failed to read latest log for resource",
      details: error,
    });
  }
};
