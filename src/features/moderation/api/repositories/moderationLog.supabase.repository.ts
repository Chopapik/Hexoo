import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  ModerationLogRepository,
  ModerationLogPayload,
} from "./moderationLog.repository.interface";

const TABLE = "moderation_logs";

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

function rowToPayload(row: any): ModerationLogPayload {
  return {
    userId: row.user_id,
    timestamp: row.timestamp ? new Date(row.timestamp) : undefined,
    verdict: row.verdict,
    categories: row.categories ?? [],
    actionTaken: row.action_taken,
    resourceType: row.resource_type ?? undefined,
    resourceId: row.resource_id ?? undefined,
    source: row.source ?? undefined,
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
    resourceType: string,
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
    resourceType: string,
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
}
