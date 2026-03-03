import { SupabaseActivityRepository } from "./implementations/activity.supabase.repository";
import { ActivityRepository } from "./activity.repository.interface";

const activityRepository: ActivityRepository =
  new SupabaseActivityRepository();

export { activityRepository };
export type { ActivityRepository };
