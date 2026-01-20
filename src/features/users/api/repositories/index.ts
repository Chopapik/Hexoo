import { FirebaseUserRepository } from "./implementations/firebaseUserRepository";
import { IUserRepository } from "./userRepository.interface";

// Singleton instance
const userRepository: IUserRepository = new FirebaseUserRepository();

export { userRepository };
export type { IUserRepository };
