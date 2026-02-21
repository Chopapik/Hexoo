import { ImageMeta } from "@/features/images/types/image.type";
import { ModerationStatus } from "@/features/shared/types/content.type";

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
  moderation_status: ModerationStatus;
  is_nsfw: boolean;
  image_url: string | null;
  image_meta: ImageMeta | null;
  device: string | null;
  flagged_reasons: string[] | null;
  flagged_source: ("text" | "image")[] | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}
