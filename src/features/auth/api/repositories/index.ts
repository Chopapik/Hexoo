import { FirebaseAuthRepository } from "./implementations/firebaseAuthRepository";
import { IAuthRepository } from "./authRepository.interface";

const authRepository: IAuthRepository = new FirebaseAuthRepository();

export { authRepository };
export type { IAuthRepository };
