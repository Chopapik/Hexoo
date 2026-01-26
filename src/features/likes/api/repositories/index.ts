import { FirebaseLikeRepository } from "./implementations/firebaseLikeRepository";
import { LikeRepository } from "./likeRepository.interface";

const likeRepository: LikeRepository = new FirebaseLikeRepository();

export { likeRepository };
export type { LikeRepository };
