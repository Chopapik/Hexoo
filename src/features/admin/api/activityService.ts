import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type ActivityType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "USER_CREATED"
  | "USER_BLOCKED"
  | "USER_UNBLOCKED"
  | "USER_DELETED"
  | "PASSWORD_CHANGED"
  | "PROFILE_UPDATED";

export const logActivity = async (
  userId: string,
  action: ActivityType,
  details: string,
  ip: string = "unknown"
) => {
  try {
    const logData = {
      userId,
      action,
      details,
      ip,
      createdAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("activity_logs").add(logData);
  } catch (error) {
    console.error("[ActivityLog] Failed to write log:", error);
  }
};
