import { CommentSupabaseRepository } from "./comment.supabase.repository";
import type { CommentRepository } from "./comment.repository.interface";

export const commentRepository: CommentRepository =
  new CommentSupabaseRepository();
