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
  Json,
} from "@/lib/supabase.database.types";

type ModerationLogRow = Tables<"moderation_logs">;
type ModerationLogInsertRow = TablesInsert<"moderation_logs">;

type StoredReasonDetails = {
  summary?: string;
  evidence?: ModerationLogPayload["evidence"];
};

function encodeReasonDetails(payload: ModerationLogPayload): string | null {
  if (!payload.evidence) return payload.reasonDetails ?? null;
  return JSON.stringify({
    summary: payload.reasonDetails,
    evidence: payload.evidence,
  } satisfies StoredReasonDetails);
}

export function toModerationContext(
  payload:
    | Omit<ModerationLogPayload, "resourceType" | "resourceId">
    | null
    | undefined,
): Json | null {
  if (!payload) return null;
  return {
    timestamp: payload.timestamp?.toISOString() ?? new Date().toISOString(),
    verdict: payload.verdict,
    categories: payload.categories ?? [],
    actionTaken: payload.actionTaken,
    source: payload.source ?? null,
    actorId: payload.actorId ?? null,
    reasonSummary: payload.reasonSummary ?? null,
    reasonDetails: payload.reasonDetails ?? null,
    evidence: payload.evidence
      ? (payload.evidence as unknown as Json)
      : null,
  };
}

function decodeReasonDetails(value: string | null): StoredReasonDetails {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as StoredReasonDetails;
    if (parsed && (parsed.summary !== undefined || parsed.evidence)) {
      return parsed;
    }
  } catch {
    // Legacy rows store plain text.
  }
  return { summary: value };
}

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
    reason_details: encodeReasonDetails(payload),
    previous_status: payload.previousStatus ?? null,
    new_status: payload.newStatus ?? null,
  };
}

export function mapModerationLogRow(
  row: ModerationLogRow,
): ModerationLogPayload {
  const details = decodeReasonDetails(row.reason_details);
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
    reasonDetails: details.summary,
    evidence: details.evidence,
    previousStatus: row.previous_status ?? undefined,
    newStatus: row.new_status ?? undefined,
  };
}
