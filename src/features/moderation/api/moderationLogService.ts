import { adminDb } from "@/lib/firebaseAdmin";
import { firestore } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface ModerationLogEntry {
  userId: string;
  timestamp: firestore.Timestamp | Date;
  verdict: "PENDING" | "REJECTED" | "APPROVED";
  categories: string[];
  actionTaken: "BLOCKED_CREATION" | "FLAGGED_FOR_REVIEW" | "CONTENT_REMOVED";
  createdAt?: firestore.Timestamp | firestore.FieldValue;
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
