import { PostEntity } from "./post.entity";
import type { Json } from "@/lib/supabase.database.types";

export type CreatePostPayload = Partial<Omit<PostEntity, "id">> & {
  moderationContext?: Json | null;
};

export type UpdatePostPayload = Partial<
  Omit<PostEntity, "id" | "createdAt" | "userId">
> & { moderationContext?: Json | null };
