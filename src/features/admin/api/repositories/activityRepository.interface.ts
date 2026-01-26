export interface ActivityRepository {
  logActivity(logData: any): Promise<void>;
}
