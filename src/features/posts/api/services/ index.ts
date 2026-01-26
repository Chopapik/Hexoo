import { PostFirebaseRepository } from "../repositories/post.firebase.repository";
import { PostContentService } from "./post.content.service";
import { PostService } from "./post.service";

const postRepository = new PostFirebaseRepository();
const postContentService = new PostContentService();

export const postService = new PostService(postRepository, postContentService);
