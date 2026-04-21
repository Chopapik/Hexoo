"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store/store";
import { PRESENCE_CHANNEL } from "../constants";

function applyPresenceState(
  channel: RealtimeChannel,
  setOnlineUids: (uids: Set<string>) => void,
) {
  const state = channel.presenceState();
  const next = new Set<string>();
  for (const key of Object.keys(state)) {
    if (key) next.add(key);
  }
  setOnlineUids(next);
}

export function usePresenceSubscription() {
  const uid = useAppStore((s) => s.auth.user?.uid ?? null);
  const setPresenceOnlineUids = useAppStore((s) => s.setPresenceOnlineUids);

  useEffect(() => {
    let cancelled = false;
    const channel: RealtimeChannel = uid
      ? supabaseClient.channel(PRESENCE_CHANNEL, {
          config: { presence: { key: uid } },
        })
      : supabaseClient.channel(PRESENCE_CHANNEL);

    const refresh = () => {
      if (!cancelled) applyPresenceState(channel, setPresenceOnlineUids);
    };

    channel
      .on("presence", { event: "sync" }, refresh)
      .on("presence", { event: "join" }, refresh)
      .on("presence", { event: "leave" }, refresh)
      .subscribe(async (status) => {
        if (cancelled || status !== "SUBSCRIBED") return;
        if (uid) {
          await channel.track({ online_at: new Date().toISOString() });
        }
        refresh();
      });

    return () => {
      cancelled = true;
      void supabaseClient.removeChannel(channel);
      setPresenceOnlineUids(new Set());
    };
  }, [uid, setPresenceOnlineUids]);

  useEffect(() => {
    if (!uid || typeof window === "undefined") return;

    const path = `${window.location.origin}/api/auth/last-online?force=1`;
    const onPageHide = () => {
      try {
        navigator.sendBeacon(path, new Blob([], { type: "text/plain" }));
      } catch {
        // ignore
      }
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [uid]);
}
