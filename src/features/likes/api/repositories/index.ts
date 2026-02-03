import { LikeFirebaseRepository } from "./like.firebase.repository";
import type { LikeRepository } from "./like.repository.interface";

const likeRepository: LikeRepository = new LikeFirebaseRepository();

export { likeRepository };
export type { LikeRepository };
