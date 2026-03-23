import { supabaseAdmin } from "@/lib/supabaseServer";
import type { LikeRepository } from "./like.repository.interface";
import type { ToggleLikePayload } from "@/features/likes/types/like.payload";

const LIKES_TABLE = "likes";

export class LikeSupabaseRepository implements LikeRepository {
  async toggleLike({
    userId,
    parentId,
    parentCollection,
  }: ToggleLikePayload): Promise<void> {
    const { error } = await supabaseAdmin.rpc("toggle_like_tx", {
      p_user_id: userId,
      p_parent_id: parentId,
      p_parent_collection: parentCollection,
    });
    if (error) throw new Error(error.message ?? "Database error");
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
    if (error) throw new Error(error.message ?? "Database error");

    return (data ?? []).map((r: { parent_id: string }) => r.parent_id);
  }
}
