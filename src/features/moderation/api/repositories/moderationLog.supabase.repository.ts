import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  ModerationLogRepository,
  ModerationLogPayload,
  ModerationActionTaken,
} from "./moderationLog.repository.interface";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";
import type { ModerationStatus } from "@/features/shared/types/content.type";
import { parseDate } from "@/features/shared/utils/dateUtils";

interface ModerationLogRow {
  user_id: string;
  timestamp: string | null;
  verdict: ModerationStatus;
  categories: string[] | null;
  action_taken: ModerationActionTaken;
  resource_type: string | null;
  resource_id: string | null;
  source: string | null;
  actor_id: string | null;
  reason_summary: string | null;
  reason_details: string | null;
}

const TABLE = "moderation_logs";

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

function payloadToRow(payload: ModerationLogPayload): Record<string, unknown> {
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

function rowToPayload(row: ModerationLogRow): ModerationLogPayload {
  return {
    userId: row.user_id,
    timestamp: parseDate(row.timestamp),
    verdict: row.verdict,
    categories: row.categories ?? [],
    actionTaken: row.action_taken,
    resourceType: toModerationResourceType(row.resource_type),
    resourceId: row.resource_id ?? undefined,
    source: toModerationSource(row.source),
    actorId: row.actor_id ?? undefined,
    reasonSummary: row.reason_summary ?? undefined,
    reasonDetails: row.reason_details ?? undefined,
  };
}

export class SupabaseModerationLogRepository implements ModerationLogRepository {
  async log(payload: ModerationLogPayload): Promise<void> {
    const row = payloadToRow(payload);
    const { error } = await supabaseAdmin.from(TABLE).insert(row);
    if (error) {
      throw error;
    }
  }

  async getLatestForResource(
    resourceType: ModerationResourceType,
    resourceId: string,
  ): Promise<ModerationLogPayload | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    return rowToPayload(data);
  }

  async getAllForResource(
    resourceType: ModerationResourceType,
    resourceId: string,
  ): Promise<ModerationLogPayload[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => rowToPayload(row));
  }

  async getLatestForUser(userId: string): Promise<ModerationLogPayload | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    return rowToPayload(data);
  }

  async getAllForUser(userId: string): Promise<ModerationLogPayload[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => rowToPayload(row));
  }

  async getLatestForResources(
    resourceType: ModerationResourceType,
    resourceIds: string[],
  ): Promise<ModerationLogPayload[]> {
    if (resourceIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("resource_type", resourceType)
      .in("resource_id", resourceIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const latestByResourceId = new Map<string, ModerationLogPayload>();

    for (const row of data ?? []) {
      const payload = rowToPayload(row);
      const id = payload.resourceId;
      if (!id) continue;
      if (!latestByResourceId.has(id)) {
        latestByResourceId.set(id, payload);
      }
    }

    return Array.from(latestByResourceId.values());
  }
}
