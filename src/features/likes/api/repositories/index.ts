import { LikeSupabaseRepository } from "./like.supabase.repository";
import type { LikeRepository } from "./like.repository.interface";

const likeRepository: LikeRepository = new LikeSupabaseRepository();

export { likeRepository };
export type { LikeRepository };
