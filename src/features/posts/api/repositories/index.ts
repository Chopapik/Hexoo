import { PostSupabaseRepository } from "./post.supabase.repository";
import { PostRepository } from "./post.repository.interface";

export const postRepository: PostRepository = new PostSupabaseRepository();
