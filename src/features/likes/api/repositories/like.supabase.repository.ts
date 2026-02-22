import { supabaseAdmin } from "@/lib/supabaseServer";
import type { LikeRepository } from "./like.repository.interface";
import type { ToggleLikePayload } from "@/features/likes/types/like.payload";

const LIKES_TABLE = "likes";
const POSTS_TABLE = "posts";
const COMMENTS_TABLE = "comments";

function parentTable(collection: "posts" | "comments"): string {
  return collection === "posts" ? POSTS_TABLE : COMMENTS_TABLE;
}

export class LikeSupabaseRepository implements LikeRepository {
  async toggleLike({
    userId,
    parentId,
    parentCollection,
  }: ToggleLikePayload): Promise<void> {
    const likeId = `${parentId}_${userId}`;
    const table = parentTable(parentCollection);

    const { data: existing } = await supabaseAdmin
      .from(LIKES_TABLE)
      .select("id")
      .eq("id", likeId)
      .maybeSingle();

    const exists = !!existing;

    if (exists) {
      const { error: delError } = await supabaseAdmin
        .from(LIKES_TABLE)
        .delete()
        .eq("id", likeId);
      if (delError) throw new Error(delError.message ?? "Database error");

      const { data: parent } = await supabaseAdmin
        .from(table)
        .select("likes_count")
        .eq("id", parentId)
        .single();
      const cur = (parent as { likes_count: number } | null)?.likes_count ?? 0;
      const { error: updateError } = await supabaseAdmin
        .from(table)
        .update({
          likes_count: Math.max(0, cur - 1),
          updated_at: new Date().toISOString(),
        })
        .eq("id", parentId);
      if (updateError) throw new Error(updateError.message ?? "Database error");
    } else {
      const { error: insertError } = await supabaseAdmin.from(LIKES_TABLE).insert({
        id: likeId,
        parent_id: parentId,
        parent_collection: parentCollection,
        user_id: userId,
        liked_at: new Date().toISOString(),
      });
      if (insertError) throw new Error(insertError.message ?? "Database error");

      const { data: parent } = await supabaseAdmin
        .from(table)
        .select("likes_count")
        .eq("id", parentId)
        .single();
      const cur = (parent as { likes_count: number } | null)?.likes_count ?? 0;
      const { error: updateError } = await supabaseAdmin
        .from(table)
        .update({
          likes_count: cur + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parentId);
      if (updateError) throw new Error(updateError.message ?? "Database error");
    }
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
