import { supabaseAdmin } from "@/lib/supabaseServer";
import type {
  UserRepository,
  BlockUserPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRestrictionPayload,
} from "./user.repository.interface";
import type { UserEntity } from "../../types/user.entity";
import type { UserRow } from "../../types/user.row";
import { parseDate } from "@/features/shared/utils/dateUtils";

const TABLE = "users";

function rowToEntity(row: UserRow): UserEntity {
  return {
    uid: row.uid,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url ?? undefined,
    avatarMeta: row.avatar_meta ?? undefined,
    createdAt: parseDate(row.created_at) ?? new Date(0),
    updatedAt: parseDate(row.updated_at),
    lastOnline: parseDate(row.last_online) ?? new Date(0),
    isActive: row.is_active ?? undefined,
    isBanned: row.is_banned ?? undefined,
    bannedAt: parseDate(row.banned_at),
    bannedBy: row.banned_by ?? undefined,
    bannedReason: row.banned_reason ?? undefined,
    isRestricted: row.is_restricted ?? undefined,
    restrictedAt: parseDate(row.restricted_at),
    restrictedBy: row.restricted_by ?? undefined,
    restrictionReason: row.restriction_reason ?? undefined,
    lastKnownIp: row.last_known_ip ?? undefined,
  };
}

export class UserSupabaseRepository implements UserRepository {
  async createUser(data: CreateUserPayload): Promise<void> {
    const nameLower = data.name.trim().toLowerCase().replace(/\s+/g, "");
    const row = {
      uid: data.uid,
      name: data.name,
      name_lowercase: nameLower,
      email: data.email,
      role: data.role ?? "user",
      avatar_url: data.avatarUrl ?? null,
      avatar_meta: data.avatarMeta ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_online: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.from(TABLE).upsert(row, {
      onConflict: "uid",
    });
    if (error) throw new Error(error.message ?? "Database error");
  }

  async getUserByUid(uid: string): Promise<UserEntity | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("uid", uid)
      .maybeSingle();
    if (error) throw new Error(error.message ?? "Database error");
    if (!data) return null;
    return rowToEntity(data as UserRow);
  }

  async getUserByName(name: string): Promise<UserEntity | null> {
    const nameLower = name.trim().toLowerCase().replace(/\s+/g, "");
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("name_lowercase", nameLower)
      .limit(1);
    if (error) throw new Error(error.message ?? "Database error");
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return rowToEntity(row as UserRow);
  }

  async getUsersByIds(
    uids: string[]
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>> {
    if (uids.length === 0) return {};
    const unique = [...new Set(uids)];
    const out: Record<string, { name: string; avatarUrl?: string | null }> = {};
    for (let i = 0; i < unique.length; i += 30) {
      const chunk = unique.slice(i, i + 30);
      const { data, error } = await supabaseAdmin
        .from(TABLE)
        .select("uid, name, avatar_url")
        .in("uid", chunk);
      if (error) throw new Error(error.message ?? "Database error");
      for (const row of data ?? []) {
        const r = row as { uid: string; name: string; avatar_url: string | null };
        out[r.uid] = { name: r.name, avatarUrl: r.avatar_url ?? null };
      }
    }
    return out;
  }

  async blockUser(data: BlockUserPayload): Promise<void> {
    if (!data.uidToBlock) throw new Error("uidToBlock is required");
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_by: data.bannedBy,
        banned_reason: data.bannedReason,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", data.uidToBlock);
    if (error) throw new Error(error.message ?? "Database error");
    // Ban enforced in app via is_banned; Supabase Auth has no "disabled" flag.
  }

  async unblockUser(uid: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update({
        is_banned: false,
        banned_at: null,
        banned_by: null,
        banned_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", uid);
    if (error) throw new Error(error.message ?? "Database error");
  }

  async updateUserRestriction({
    uid,
    isRestricted,
    restrictedBy,
    restrictedReason,
  }: UpdateUserRestrictionPayload): Promise<void> {
    const update: Record<string, unknown> = {
      is_restricted: isRestricted,
      updated_at: new Date().toISOString(),
    };
    if (isRestricted) {
      update.restricted_at = new Date().toISOString();
      update.restricted_by = restrictedBy ?? null;
      update.restriction_reason = restrictedReason ?? null;
    } else {
      update.restricted_at = null;
      update.restricted_by = null;
      update.restriction_reason = null;
    }
    const { error } = await supabaseAdmin.from(TABLE).update(update).eq("uid", uid);
    if (error) throw new Error(error.message ?? "Database error");
  }

  async getAllUsers(): Promise<UserEntity[]> {
    const { data, error } = await supabaseAdmin.from(TABLE).select("*");
    if (error) throw new Error(error.message ?? "Database error");
    return (data ?? []).map((row) => rowToEntity(row as UserRow));
  }

  async deleteUser(uid: string): Promise<void> {
    const { error } = await supabaseAdmin.from(TABLE).delete().eq("uid", uid);
    if (error) throw new Error(error.message ?? "Database error");
  }

  async updateUser(uid: string, data: UpdateUserPayload): Promise<void> {
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) {
      row.name = data.name;
      row.name_lowercase = data.name.trim().toLowerCase().replace(/\s+/g, "");
    }
    if (data.email !== undefined) row.email = data.email;
    if (data.role !== undefined) row.role = data.role;
    if (data.avatarUrl !== undefined) row.avatar_url = data.avatarUrl;
    if (data.avatarMeta !== undefined) row.avatar_meta = data.avatarMeta;
    if (data.lastOnline !== undefined)
      row.last_online =
        data.lastOnline instanceof Date
          ? data.lastOnline.toISOString()
          : data.lastOnline;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    if (data.lastKnownIp !== undefined) row.last_known_ip = data.lastKnownIp;
    const { error } = await supabaseAdmin.from(TABLE).update(row).eq("uid", uid);
    if (error) throw new Error(error.message ?? "Database error");
  }
}
