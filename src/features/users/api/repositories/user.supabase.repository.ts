import { supabaseAdmin } from "@/lib/supabaseServer";
import { throwDbError } from "@/lib/supabaseRepository";
import type {
  UserRepository,
  BlockUserPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRestrictionPayload,
} from "./user.repository.interface";
import type { UserEntity } from "../../types/user.entity";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { UserSummaryRow } from "../../types/user.row";
import {
  mapUserRow,
  mapUserSummaryRow,
  toBlockUserRow,
  toCreateUserRow,
  toOAuthPendingUserRow,
  toRestrictionUpdateRow,
  toUnblockUserRow,
  toUpdateUserRow,
} from "./user.supabase.mapper";

const TABLE = "users";

export class UserSupabaseRepository implements UserRepository {
  async createUser(data: CreateUserPayload): Promise<void> {
    const row = toCreateUserRow(data);
    const { error } = await supabaseAdmin.from(TABLE).upsert(row, {
      onConflict: "uid",
    });
    throwDbError(error);
  }

  async createOAuthPendingUser(data: {
    uid: string;
    email: string;
  }): Promise<void> {
    const row = toOAuthPendingUserRow(data);
    const { error } = await supabaseAdmin.from(TABLE).insert(row);
    throwDbError(error);
  }

  async getUserByUid(uid: string): Promise<UserEntity | null> {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    throwDbError(error);
    if (!data) return null;
    return mapUserRow(data);
  }

  async getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarMeta?: ImageMeta | null }>> {
    if (uids.length === 0) return {};
    const unique = [...new Set(uids)];
    const out: Record<string, { name: string; avatarMeta?: ImageMeta | null }> =
      {};
    for (let i = 0; i < unique.length; i += 30) {
      const chunk = unique.slice(i, i + 30);
      const { data, error } = await supabaseAdmin
        .from(TABLE)
        .select("uid, display_name, avatar_meta, deleted_at")
        .in("uid", chunk)
        .is("deleted_at", null);
      throwDbError(error);
      for (const row of (data ?? []) as UserSummaryRow[]) {
        out[row.uid] = mapUserSummaryRow(row);
      }
    }
    return out;
  }

  async blockUser(data: BlockUserPayload): Promise<void> {
    if (!data.uidToBlock) throw new Error("uidToBlock is required");
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update(toBlockUserRow(data))
      .eq("uid", data.uidToBlock);
    throwDbError(error);
    // Ban enforced in app via is_banned; Supabase Auth has no "disabled" flag.
  }

  async unblockUser(uid: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update(toUnblockUserRow())
      .eq("uid", uid);
    throwDbError(error);
  }

  async updateUserRestriction({
    uid,
    isRestricted,
    restrictedBy,
    restrictedReason,
  }: UpdateUserRestrictionPayload): Promise<void> {
    const update = toRestrictionUpdateRow({
      uid,
      isRestricted,
      restrictedBy,
      restrictedReason,
    });
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update(update)
      .eq("uid", uid);
    throwDbError(error);
  }

  async getAllUsers(): Promise<UserEntity[]> {
    const { data, error } = await supabaseAdmin.from(TABLE).select("*");
    throwDbError(error);
    return (data ?? []).map(mapUserRow);
  }

  async deleteUser(uid: string): Promise<void> {
    const { error } = await supabaseAdmin.from(TABLE).delete().eq("uid", uid);
    throwDbError(error);
  }

  async updateUser(uid: string, data: UpdateUserPayload): Promise<void> {
    const row = toUpdateUserRow(data);
    const { error } = await supabaseAdmin
      .from(TABLE)
      .update(row)
      .eq("uid", uid);
    throwDbError(error);
  }
}
