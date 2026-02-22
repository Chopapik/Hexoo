import { UserSupabaseRepository } from "./user.supabase.repository";
import { UserRepository } from "./user.repository.interface";

export const userRepository: UserRepository = new UserSupabaseRepository();
