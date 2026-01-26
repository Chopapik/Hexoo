export type ActivityType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "USER_CREATED"
  | "USER_BLOCKED"
  | "USER_UNBLOCKED"
  | "USER_DELETED"
  | "PASSWORD_CHANGED"
  | "PROFILE_UPDATED"
  | "USER_RESTRICTED"
  | "USER_UNRESTRICTED";

export interface ActivityService {
  logActivity(
    userId: string,
    action: ActivityType,
    details: string,
  ): Promise<void>;
}
