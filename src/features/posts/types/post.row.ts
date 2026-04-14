import { ImageMeta } from "@/features/images/types/image.type";

/**
 * Row shape for table `posts` in Supabase (snake_case).
 */
export interface PostRow {
  id: string;
  user_id: string;
  text: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string | null;
  is_nsfw: boolean;
  is_pending: boolean;
  is_edited: boolean;
  image_meta: ImageMeta | null;
  device: string | null;
}
