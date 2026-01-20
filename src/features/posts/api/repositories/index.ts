import { FirebasePostRepository } from "./implementations/firebasePostRepository";
import { IPostRepository } from "./postRepository.interface";

const postRepository: IPostRepository = new FirebasePostRepository();

export { postRepository };
export type { IPostRepository };
