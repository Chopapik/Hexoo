import { parseDate } from "@/features/shared/utils/dateUtils";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type {
  ModerationActionTaken,
  ModerationLogPayload,
} from "./moderationLog.repository.interface";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";
import type {
  Tables,
  TablesInsert,
} from "@/lib/supabase.database.types";

type ModerationLogRow = Tables<"moderation_logs">;
type ModerationLogInsertRow = TablesInsert<"moderation_logs">;

function toModerationStatus(value: string): ModerationStatus {
  if (value === ModerationStatus.Approved) return ModerationStatus.Approved;
  if (value === ModerationStatus.Rejected) return ModerationStatus.Rejected;
  return ModerationStatus.Pending;
}

function toModerationActionTaken(value: string): ModerationActionTaken {
  if (value === "BLOCKED_CREATION" || value === "CONTENT_REMOVED") {
    return value;
  }
  return "FLAGGED_FOR_REVIEW";
}

function toModerationResourceType(
  value: string | null,
): ModerationResourceType | undefined {
  if (value === "post" || value === "comment") {
    return value;
  }
  return undefined;
}

function toModerationSource(
  value: string | null,
): ModerationLogPayload["source"] | undefined {
  if (value === "ai" || value === "user_report" || value === "moderator") {
    return value;
  }
  return undefined;
}

export function toModerationLogInsertRow(
  payload: ModerationLogPayload,
): ModerationLogInsertRow {
  return {
    user_id: payload.userId,
    timestamp: payload.timestamp
      ? payload.timestamp.toISOString()
      : new Date().toISOString(),
    verdict: payload.verdict,
    categories: payload.categories ?? [],
    action_taken: payload.actionTaken,
    resource_type: payload.resourceType ?? null,
    resource_id: payload.resourceId ?? null,
    source: payload.source ?? null,
    actor_id: payload.actorId ?? null,
    reason_summary: payload.reasonSummary ?? null,
    reason_details: payload.reasonDetails ?? null,
  };
}

export function mapModerationLogRow(
  row: ModerationLogRow,
): ModerationLogPayload {
  return {
    userId: row.user_id,
    timestamp: parseDate(row.timestamp),
    verdict: toModerationStatus(row.verdict),
    categories: row.categories ?? [],
    actionTaken: toModerationActionTaken(row.action_taken),
    resourceType: toModerationResourceType(row.resource_type),
    resourceId: row.resource_id ?? undefined,
    source: toModerationSource(row.source),
    actorId: row.actor_id ?? undefined,
    reasonSummary: row.reason_summary ?? undefined,
    reasonDetails: row.reason_details ?? undefined,
  };
}
