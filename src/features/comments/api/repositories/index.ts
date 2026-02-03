import { CommentFirebaseRepository } from "./comment.firebase.repository";
import type { CommentRepository } from "./comment.repository.interface";

export const commentRepository: CommentRepository =
  new CommentFirebaseRepository();
