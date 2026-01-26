import { FirebaseAuthRepository } from "./implementations/firebaseAuthRepository";
import { AuthRepository } from "./authRepository.interface";

const authRepository: AuthRepository = new FirebaseAuthRepository();

export { authRepository };
export type { AuthRepository };
