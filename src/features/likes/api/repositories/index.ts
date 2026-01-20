import { FirebaseLikeRepository } from "./implementations/firebaseLikeRepository";
import { ILikeRepository } from "./likeRepository.interface";

const likeRepository: ILikeRepository = new FirebaseLikeRepository();

export { likeRepository };
export type { ILikeRepository };
