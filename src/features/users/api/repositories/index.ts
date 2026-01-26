import { UserFirebaseRepository } from "./user.firebase.repository";
import { UserRepository } from "./user.repository.interface";

export const userRepository: UserRepository = new UserFirebaseRepository();
