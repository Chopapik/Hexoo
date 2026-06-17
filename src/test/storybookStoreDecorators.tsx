import { useEffect, type ComponentType } from "react";

import type { SessionData } from "@/features/me/me.type";
import { useAppStore } from "@/lib/store/store";

export function createUserDecorator(user: SessionData | null) {
  function StoreUserDecorator(Story: ComponentType) {
    const setUser = useAppStore((state) => state.setUser);

    useEffect(() => {
      setUser(user);

      return () => setUser(null);
    }, [setUser]);

    return <Story />;
  }

  StoreUserDecorator.displayName = "StoreUserDecorator";

  return StoreUserDecorator;
}

export function createPresenceDecorator({
  currentUser,
  uids,
}: {
  currentUser: SessionData;
  uids: string[];
}) {
  function StorePresenceDecorator(Story: ComponentType) {
    const setUser = useAppStore((state) => state.setUser);
    const setPresenceOnlineUids = useAppStore(
      (state) => state.setPresenceOnlineUids,
    );

    useEffect(() => {
      setUser(currentUser);
      setPresenceOnlineUids(new Set(uids));

      return () => {
        setUser(null);
        setPresenceOnlineUids(new Set());
      };
    }, [setPresenceOnlineUids, setUser]);

    return <Story />;
  }

  StorePresenceDecorator.displayName = "StorePresenceDecorator";

  return StorePresenceDecorator;
}
