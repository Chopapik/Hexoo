import { supabaseAdmin } from "@/lib/supabaseServer";
import { throwDbError } from "@/lib/supabaseRepository";
import type { Database, Tables } from "@/lib/supabase.database.types";
import type { LikeRepository } from "./like.repository.interface";
import type { SetLikeStatePayload } from "@/features/likes/types/like.payload";
import type {
  LikeParentCollection,
  SetLikeStateResponseDto,
} from "@/features/likes/types/like.dto";
import { createAppError } from "@/lib/AppError";

const LIKES_TABLE = "likes";

type SetLikeStateTxArgs =
  Database["public"]["Functions"]["set_like_state_tx"]["Args"];
type LikeParentRow = Pick<Tables<"likes">, "parent_id">;

export class LikeSupabaseRepository implements LikeRepository {
  async setLikeState({
    userId,
    parentId,
    parentCollection,
    liked,
  }: SetLikeStatePayload): Promise<SetLikeStateResponseDto> {
    const payload: SetLikeStateTxArgs = {
      p_user_id: userId,
      p_parent_id: parentId,
      p_parent_collection: parentCollection,
      p_liked: liked,
    };
    const { data, error } = await supabaseAdmin.rpc(
      "set_like_state_tx",
      payload,
    );
    if (error?.message?.includes("not found")) {
      throw createAppError({ code: "NOT_FOUND", message: error.message });
    }
    throwDbError(error);
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      typeof data.liked !== "boolean" ||
      typeof data.likesCount !== "number"
    ) {
      throw createAppError({
        code: "DB_ERROR",
        message: "Invalid set_like_state_tx response",
      });
    }
    return { liked: data.liked, likesCount: data.likesCount };
  }

  async getLikesForParents(
    userId: string,
    parentCollection: LikeParentCollection,
    parentIds: string[],
  ): Promise<string[]> {
    if (!userId || parentIds.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from(LIKES_TABLE)
      .select("parent_id")
      .eq("user_id", userId)
      .eq("parent_collection", parentCollection)
      .in("parent_id", parentIds);
    throwDbError(error);

    return ((data ?? []) as LikeParentRow[]).map((row) => row.parent_id);
  }
}
