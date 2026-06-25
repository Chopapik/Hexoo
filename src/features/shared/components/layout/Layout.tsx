"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Header } from "./Header";
import { LeftNav } from "./LeftNav/LeftNav";
import { BottomNav } from "./LeftNav/BottomNav";
import { RightNavOverlay, RightNavSidebar } from "./RightNav/RightNav";
import { RightNavGuestDisclaimer } from "./RightNav/RightNavGuestDisclaimer";
import { useAppStore } from "@/lib/store/store";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import SessionWatcher from "@/features/auth/components/SessionWatcher";
import { PresenceSubscription } from "@/features/presence/components/PresenceSubscription";
import type { SessionData } from "@/features/me/me.type";
import { Logo } from "@/features/shared/components/ui/Logo";

const leftRailAsideClass =
  "hidden md:flex sticky top-[76px] h-[calc(100dvh-76px)] w-[235px] shrink-0 justify-center";
const rightRailAsideClass =
  "hidden lg:flex sticky top-[76px] h-[calc(100dvh-76px)] w-[235px] shrink-0 justify-center";

function LeftRailWidthSpacer() {
  return (
    <div
      className="invisible pointer-events-none h-full w-full shrink-0"
      aria-hidden
    />
  );
}

const subscribeToHydration = (onStoreChange: () => void) => {
  queueMicrotask(onStoreChange);
  return () => {};
};

const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export const Layout: React.FC<{
  children: React.ReactNode;
  initialUser: SessionData | null;
}> = ({ children, initialUser }) => {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);
  const openRight = () => setIsRightNavOpen(true);
  const closeRight = () => setIsRightNavOpen(false);

  const user = useAppStore((s) => s.auth.user);
  const setUser = useAppStore((s) => s.setUser);
  const language = useAppStore((s) => s.settings.language);
  const initializeLanguage = useAppStore((s) => s.initializeLanguage);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Sliding session: re-set cookies in Route Handler so expiry extends 1 year from this visit
  useEffect(() => {
    if (!user) return;
    fetch("/api/auth/slide", { credentials: "include" }).catch(() => {});
    fetch("/api/auth/last-online", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [user]);

  if (!isHydrated) {
    return (
      <div className="w-full min-h-screen bg-page-background-default flex items-center justify-center">
        <Logo compactOnMobile={false} className="flex items-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-page-background-default">
      <PresenceSubscription />
      <SessionWatcher />
      <header className="fixed inset-x-0 top-0 z-50">
        <Header user={user} />
      </header>
      <div className="mx-auto w-full max-w-[1440px] pt-[108px] md:pt-[76px]">
        <div className="flex w-full items-start md:gap-4">
          <aside className={leftRailAsideClass}>
            {user ? (
              <LeftNav onOpenRight={openRight} user={user} />
            ) : (
              <LeftRailWidthSpacer />
            )}
          </aside>
          <main className="min-w-0 flex-1 px-2 pb-[84px] md:px-0 md:pb-0">
            {children}
          </main>
          <aside className={rightRailAsideClass}>
            {user ? <RightNavSidebar /> : <RightNavGuestDisclaimer />}
          </aside>
        </div>
      </div>
      {user ? (
        <div className="pointer-events-none fixed bottom-[26px] left-[10px] right-[10px] z-40 flex justify-center px-8 md:hidden">
          <BottomNav onOpenRight={openRight} user={user} />
        </div>
      ) : null}
      {user ? (
        <RightNavOverlay open={isRightNavOpen} onClose={closeRight} />
      ) : null}
      <CreatePostModal />
    </div>
  );
};
