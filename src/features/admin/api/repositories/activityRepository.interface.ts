export interface IActivityRepository {
  logActivity(logData: any): Promise<void>;
}
