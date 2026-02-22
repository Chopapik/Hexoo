import { SupabaseAuthRepository } from "./implementations/supabaseAuthRepository";
import { AuthRepository } from "./authRepository.interface";

const authRepository: AuthRepository = new SupabaseAuthRepository();

export { authRepository };
export type { AuthRepository };
