"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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

type LayoutProps = {
  children: ReactNode;
  initialUser: SessionData | null;
};

const SIDEBAR_TOP = "72px";

const layoutVars = {
  "--hexoo-sidebar-top": SIDEBAR_TOP,
} as CSSProperties;

const railClass = "hidden shrink-0 self-stretch w-[235px]";
const stickyRailClass =
  "sticky z-30 h-[calc(100dvh-var(--hexoo-sidebar-top))] min-h-[720px]";

export const Layout = ({ children, initialUser }: LayoutProps) => {
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);
  const [initialUserSynced, setInitialUserSynced] = useState(false);

  const storeUser = useAppStore((s) => s.auth.user);
  const setUser = useAppStore((s) => s.setUser);
  const language = useAppStore((s) => s.settings.language);
  const initializeLanguage = useAppStore((s) => s.initializeLanguage);
  const user = initialUserSynced ? storeUser : initialUser;

  useEffect(() => {
    setUser(initialUser);
    queueMicrotask(() => {
      setInitialUserSynced(true);
    });
  }, [initialUser, setUser]);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!user) return;

    void fetch("/api/auth/slide", {
      credentials: "include",
    });

    void fetch("/api/auth/last-online", {
      method: "POST",
      credentials: "include",
    });
  }, [user]);

  return (
    <div
      className="relative min-h-dvh w-full bg-page-background-default text-foreground-primary-default"
      style={layoutVars}
    >
      <PresenceSubscription />
      <SessionWatcher />

      <header className="fixed inset-x-0 top-0 z-50">
        <Header user={user} />
      </header>

      <div className="mx-auto w-full max-w-[1440px] pt-[108px] md:pt-[72px]">
        <div className="flex w-full items-start gap-4">
          <aside className={`${railClass} md:block`}>
            <div
              className={stickyRailClass}
              style={{ top: "var(--hexoo-sidebar-top)" }}
            >
              <LeftNav
                user={user}
                onOpenRight={() => setIsRightNavOpen(true)}
              />
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-2 pb-[112px] md:px-0 md:pb-8">
            {children}
          </main>

          <aside className={`${railClass} lg:block`}>
            <div
              className={stickyRailClass}
              style={{ top: "var(--hexoo-sidebar-top)" }}
            >
              {user ? <RightNavSidebar /> : <RightNavGuestDisclaimer />}
            </div>
          </aside>
        </div>
      </div>

      {user && (
        <>
          <div className="pointer-events-none fixed bottom-[26px] left-0 right-0 z-40 flex justify-center px-8 md:hidden">
            <BottomNav
              user={user}
              onOpenRight={() => setIsRightNavOpen(true)}
            />
          </div>

          <RightNavOverlay
            open={isRightNavOpen}
            onClose={() => setIsRightNavOpen(false)}
          />
        </>
      )}

      <CreatePostModal />
    </div>
  );
};
