import { createAppError } from "@/lib/AppError";
import type { ActivityType } from "../../types/activity.type";
import type { ActivityRepository } from "../repositories";
import type {
  ActivityService as IActivityService,
  AdminActivityLog,
} from "./activity.service.interface";
import type { SessionData } from "@/features/me/me.type";

export class ActivityService implements IActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly session: SessionData | null,
  ) {}

  private ensureAdmin() {
    if (!this.session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[activityService.ensureAdmin] No session found",
      });
    }

    if (this.session.role !== "admin") {
      throw createAppError({
        code: "FORBIDDEN",
        message: "[activityService.ensureAdmin] Admin role required",
      });
    }
  }

  async logActivity(
    userId: string,
    action: ActivityType,
    details: string,
  ): Promise<void> {
    try {
      await this.repository.logActivity({
        userId,
        action,
        details,
      });
    } catch (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[ActivityLog] Failed to write log",
        details: error,
      });
    }
  }

  async getAdminActivityLogs(
    limit: number,
    startAfter?: string,
  ): Promise<AdminActivityLog[]> {
    this.ensureAdmin();

    try {
      return await this.repository.getAdminActivityLogs(limit, startAfter);
    } catch (error) {
      throw createAppError({
        code: "DB_ERROR",
        message: "[ActivityLog] Failed to fetch logs",
        details: error,
      });
    }
  }
}

