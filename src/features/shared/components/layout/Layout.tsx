"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Header } from "./Header";
import { LeftNav } from "./LeftNav/LeftNav";
import { BottomNav } from "./LeftNav/BottomNav";
import { RightNavSidebar, RightNavOverlay } from "./RightNav/RightNav";
import { useAppStore } from "@/lib/store/store";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import LogoSvg from "@/features/shared/assets/Logo.svg?url";
import SessionWatcher from "@/features/auth/components/SessionWatcher";
import { PresenceSubscription } from "@/features/presence/components/PresenceSubscription";

const leftRailAsideClass =
  "hidden md:block sticky top-[calc(56.6px+16px+16px)] h-[calc(100vh-56.6px-16px-16px-16px)] shrink-0";
const rightRailAsideClass =
  "hidden lg:block sticky top-[calc(56.6px+16px+16px)] h-[calc(100vh-56.6px-16px-16px-16px)] shrink-0";

/** Ta sama szerokość co `LeftNav` / `RightNavSidebar`, żeby gość miał feed wyśrodkowany jak zalogowany. */
function LeftRailWidthSpacer() {
  return (
    <div
      className="invisible pointer-events-none md:w-20 xl:w-72 shrink-0"
      aria-hidden
    />
  );
}

function RightRailWidthSpacer() {
  return (
    <div
      className="invisible pointer-events-none md:w-20 lg:w-[244px] xl:w-72 shrink-0"
      aria-hidden
    />
  );
}

export const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);
  const openRight = () => setIsRightNavOpen(true);
  const closeRight = () => setIsRightNavOpen(false);

  const user = useAppStore((s) => s.auth.user);
  const isCreatePostModalOpen = useAppStore((s) => s.createPostModal.isOpen);
  const closeCreatePostModal = useAppStore((s) => s.closeCreatePostModal);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <Image src={LogoSvg} alt="Hexoo" priority className="w-44 h-auto" />
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-page-background w-full min-h-screen">
      <PresenceSubscription />
      <SessionWatcher />
      <div className="flex flex-col w-full max-w-[1440px]">
        <header className="sticky top-0 z-50 bg-page-background px-2 py-2 md:px-4 md:py-4">
          <div className="mx-auto w-full">
            <Header user={user} />
          </div>
        </header>
        <div className="mx-auto w-full px-2 md:px-4 flex-1">
          <div className="flex gap-4 items-start">
            <aside className={leftRailAsideClass}>
              {user ? (
                <LeftNav onOpenRight={openRight} user={user} />
              ) : (
                <LeftRailWidthSpacer />
              )}
            </aside>
            <main className="flex-1 min-w-0">{children}</main>
            <aside className={rightRailAsideClass}>
              {user ? <RightNavSidebar /> : <RightRailWidthSpacer />}
            </aside>
          </div>
        </div>
        {user ? (
          <div className="md:hidden sticky bottom-0 px-2 pb-2 bg-page-background">
            <div className="mx-auto w-full pt-2">
              <BottomNav onOpenRight={openRight} />
            </div>
          </div>
        ) : null}
        {user ? (
          <RightNavOverlay open={isRightNavOpen} onClose={closeRight} />
        ) : null}
        <CreatePostModal
          isOpen={!!user && isCreatePostModalOpen}
          onClose={closeCreatePostModal}
        />
      </div>
    </div>
  );
};
