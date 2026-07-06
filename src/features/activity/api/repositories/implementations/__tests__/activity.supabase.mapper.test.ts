import { describe, expect, it } from "vitest";
import type { ActivityLogInput } from "@/features/activity/types/activity.type";
import {
  indexActivityUsersById,
  mapAdminActivityLog,
  toActivityLogInsertRow,
} from "../activity.supabase.mapper";
import type {
  ActivityLogRow,
  ActivityLogUserRow,
} from "../activity.supabase.mapper";

describe("activity.supabase.mapper", () => {
  it("maps activity input to insert row and defaults null details to an empty string", () => {
    expect(
      toActivityLogInsertRow({
        userId: "user-activity-1",
        action: "PROFILE_UPDATED",
        details: "Changed display name",
      }),
    ).toEqual({
      user_id: "user-activity-1",
      action: "PROFILE_UPDATED",
      details: "Changed display name",
    });

    expect(
      toActivityLogInsertRow({
        userId: "user-activity-2",
        action: "LOGIN_SUCCESS",
        details: null as unknown as ActivityLogInput["details"],
      }),
    ).toEqual({
      user_id: "user-activity-2",
      action: "LOGIN_SUCCESS",
      details: "",
    });
  });

  it("indexes activity users by uid", () => {
    const firstUser: ActivityLogUserRow = {
      uid: "user-activity-1",
      display_name: "First User",
      email: "first@example.test",
      role: "user",
    };
    const secondUser: ActivityLogUserRow = {
      uid: "user-activity-2",
      display_name: "Second User",
      email: "second@example.test",
      role: "admin",
    };

    expect(indexActivityUsersById([firstUser, secondUser])).toEqual({
      "user-activity-1": firstUser,
      "user-activity-2": secondUser,
    });
  });

  it("maps admin activity log and masks the user email", () => {
    const row: ActivityLogRow = {
      id: "activity-1",
      user_id: "user-activity-3",
      action: "ADMIN_CREATED_USER",
      details: "Admin created user",
      created_at: "2026-07-06T09:10:11.000Z",
    };
    const user: ActivityLogUserRow = {
      uid: "user-activity-3",
      display_name: "Private Person",
      email: "private@example.test",
      role: "admin",
    };

    expect(mapAdminActivityLog(row, user)).toEqual({
      id: "activity-1",
      userId: "user-activity-3",
      action: "ADMIN_CREATED_USER",
      details: "Admin created user",
      createdAt: "2026-07-06T09:10:11.000Z",
      userName: "Private Person",
      userEmail: "pr*****@example.test",
      userRole: "admin",
    });
  });

  it("uses empty details and null user fields when the user row is missing", () => {
    const row: ActivityLogRow = {
      id: "activity-2",
      user_id: "missing-user",
      action: "COMMENT_DELETED",
      details: null,
      created_at: "2026-07-06T10:11:12.000Z",
    };

    expect(mapAdminActivityLog(row, undefined)).toEqual({
      id: "activity-2",
      userId: "missing-user",
      action: "COMMENT_DELETED",
      details: "",
      createdAt: "2026-07-06T10:11:12.000Z",
      userName: null,
      userEmail: null,
      userRole: null,
    });
  });
});
