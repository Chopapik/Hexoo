import { postRepository } from "../repositories";
import { likeRepository } from "@/features/likes/api/repositories";
import { deleteImage } from "@/features/images/api/imageService";
import { PostContentService } from "./post.content.service";
import { PostService } from "./post.service";

const postContentService = new PostContentService();

export const postService = new PostService(
  postRepository,
  postContentService,
  likeRepository,
  deleteImage // In the future, replace with an image service instance when the image service will be solid.
);

export { PostService };
