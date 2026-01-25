import { PostFirebaseRepository } from "./post.firebase.repository";
import { PostRepository } from "./post.repository.interface";

export const postRepository: PostRepository = new PostFirebaseRepository();
