import { ImageMeta } from "@/features/images/types/image.type";

/**
 * Row shape for table `comments` in Supabase (snake_case).
 */
export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string | null;
  is_nsfw: boolean;
  is_pending: boolean;
  image_meta: ImageMeta | null;
  device: string | null;
}
