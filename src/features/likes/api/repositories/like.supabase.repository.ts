import { supabaseAdmin } from "@/lib/supabaseServer";
import { throwDbError } from "@/lib/supabaseRepository";
import type { Database, Tables } from "@/lib/supabase.database.types";
import type { LikeRepository } from "./like.repository.interface";
import type { ToggleLikePayload } from "@/features/likes/types/like.payload";

const LIKES_TABLE = "likes";

type ToggleLikeTxArgs =
  Database["public"]["Functions"]["toggle_like_tx"]["Args"];
type LikeParentRow = Pick<Tables<"likes">, "parent_id">;

export class LikeSupabaseRepository implements LikeRepository {
  async toggleLike({
    userId,
    parentId,
    parentCollection,
  }: ToggleLikePayload): Promise<void> {
    const payload: ToggleLikeTxArgs = {
      p_user_id: userId,
      p_parent_id: parentId,
      p_parent_collection: parentCollection,
    };
    const { error } = await supabaseAdmin.rpc("toggle_like_tx", payload);
    throwDbError(error);
  }

  async getLikesForParents(
    userId: string,
    parentIds: string[]
  ): Promise<string[]> {
    if (!userId || parentIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(LIKES_TABLE)
      .select("parent_id")
      .eq("user_id", userId)
      .in("parent_id", parentIds);
    throwDbError(error);

    return ((data ?? []) as LikeParentRow[]).map((row) => row.parent_id);
  }
}
