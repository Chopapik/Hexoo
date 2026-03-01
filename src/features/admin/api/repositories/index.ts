import { SupabaseActivityRepository } from "./implementations/supabaseActivityRepository";
import { ActivityRepository } from "./activityRepository.interface";

const activityRepository: ActivityRepository =
  new SupabaseActivityRepository();

export { activityRepository };
export type { ActivityRepository };
