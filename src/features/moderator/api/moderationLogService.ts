import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export interface ModerationLogEntry {
  userId: string;
  timestamp: string;
  verdict: "PENDING" | "REJECTED";
  categories: string[];
  actionTaken: "BLOCKED_CREATION" | "FLAGGED_FOR_REVIEW";
}

export const logModerationEvent = async (entry: ModerationLogEntry) => {
  try {
    await adminDb.collection("moderation_logs").add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(
      `[ModerationLog] Logged event for user ${entry.userId}: ${entry.verdict}`
    );
  } catch (error) {
    console.error("[ModerationLog] Failed to log event:", error);
  }
};
