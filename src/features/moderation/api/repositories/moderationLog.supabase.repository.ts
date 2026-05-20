import { supabaseAdmin } from "@/lib/supabaseServer";
import { throwDbError } from "@/lib/supabaseRepository";
import type {
  ModerationLogRepository,
  ModerationLogPayload,
} from "./moderationLog.repository.interface";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";
import {
  mapModerationLogRow,
  toModerationLogInsertRow,
} from "./moderationLog.supabase.mapper";

const TABLE = "moderation_logs";

export class SupabaseModerationLogRepository implements ModerationLogRepository {
  async log(payload: ModerationLogPayload): Promise<void> {
    const row = toModerationLogInsertRow(payload);
    const { error } = await supabaseAdmin.from(TABLE).insert(row);
    throwDbError(error);
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

    throwDbError(error);

    if (!data) return null;
    return mapModerationLogRow(data);
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

    throwDbError(error);

    return (data ?? []).map(mapModerationLogRow);
  }

  async getLatestForUser(userId: string): Promise<ModerationLogPayload | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    throwDbError(error);

    if (!data) return null;
    return mapModerationLogRow(data);
  }

  async getAllForUser(userId: string): Promise<ModerationLogPayload[]> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    throwDbError(error);

    return (data ?? []).map(mapModerationLogRow);
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

    throwDbError(error);

    const latestByResourceId = new Map<string, ModerationLogPayload>();

    for (const row of data ?? []) {
      const payload = mapModerationLogRow(row);
      const id = payload.resourceId;
      if (!id) continue;
      if (!latestByResourceId.has(id)) {
        latestByResourceId.set(id, payload);
      }
    }

    return Array.from(latestByResourceId.values());
  }
}
