import { createAppError } from "@/lib/AppError";
import { SupabaseModerationLogRepository } from "../repositories/moderationLog.supabase.repository";
import type { ModerationLogPayload } from "../repositories/moderationLog.repository.interface";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";

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
  resourceType: ModerationResourceType,
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

export const getModerationLogsForResource = async (
  resourceType: ModerationResourceType,
  resourceIds: string[],
): Promise<Record<string, ModerationLogPayload>> => {
  try {
    const logs = await moderationLogRepository.getLatestForResources(
      resourceType,
      resourceIds,
    );

    const byId: Record<string, ModerationLogPayload> = {};
    for (const log of logs) {
      if (!log.resourceId) continue;
      if (!byId[log.resourceId]) {
        byId[log.resourceId] = log;
      }
    }

    return byId;
  } catch (error) {
    throw createAppError({
      code: "DB_ERROR",
      message: "[ModerationLog] Failed to read latest logs for resources",
      details: error,
    });
  }
};
