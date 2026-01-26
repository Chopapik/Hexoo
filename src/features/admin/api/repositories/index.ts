import { FirebaseActivityRepository } from "./implementations/firebaseActivityRepository";
import { ActivityRepository } from "./activityRepository.interface";

const activityRepository: ActivityRepository =
  new FirebaseActivityRepository();

export { activityRepository };
export type { ActivityRepository };
