import { FirebaseActivityRepository } from "./implementations/firebaseActivityRepository";
import { IActivityRepository } from "./activityRepository.interface";

const activityRepository: IActivityRepository =
  new FirebaseActivityRepository();

export { activityRepository };
export type { IActivityRepository };
