import {
  collection,
  addDoc,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";

export type ActionStatus = "success" | "error";
export type ActionType = string;

export interface ActionPayload {
  actionType: ActionType;
  status?: ActionStatus;
  userId?: string | null;
  username?: string | null;
  performedBy?: string | null;
  message?: string | null;
  userAgent?: string | null;
  resource?: Record<string, unknown> | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
}

export function useActionLogger(db: Firestore) {
  const logAction = async (payload: ActionPayload) => {
    try {
      const doc = {
        ...payload,
        status: payload.status ?? "success",
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "actions"), doc);
      console.log(`[action] ${payload.actionType} logged`);
      return { ok: true };
    } catch (err) {
      console.error("[action] log error:", err);
      return { ok: false, error: err };
    }
  };

  return { logAction };
}
