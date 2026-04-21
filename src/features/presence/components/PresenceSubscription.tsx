"use client";

import { usePresenceSubscription } from "../hooks/usePresenceSubscription";

/** Mount once under app layout; keeps Realtime Presence in sync with the store. */
export function PresenceSubscription() {
  usePresenceSubscription();
  return null;
}
