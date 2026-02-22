import { ImageMeta } from "@/features/images/types/image.type";
import { UserRole } from "./user.type";

/**
 * Row shape for table `users` in Supabase (snake_case).
 */
export interface UserRow {
  uid: string;
  name: string;
  name_lowercase: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  avatar_meta: ImageMeta | null;
  created_at: string;
  updated_at: string | null;
  last_online: string;
  is_active: boolean | null;
  is_banned: boolean | null;
  banned_at: string | null;
  banned_by: string | null;
  banned_reason: string | null;
  is_restricted: boolean | null;
  restricted_at: string | null;
  restricted_by: string | null;
  restriction_reason: string | null;
  last_known_ip: string | null;
}
