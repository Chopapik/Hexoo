"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Header } from "./Header";
import { LeftNav } from "./LeftNav/LeftNav";
import { BottomNav } from "./LeftNav/BottomNav";
import {
  RightNavOverlay,
  RightNavSidebar,
} from "./RightNav/RightNav";
import { RightNavGuestDisclaimer } from "./RightNav/RightNavGuestDisclaimer";
import { useAppStore } from "@/lib/store/store";
import CreatePostModal from "@/features/posts/components/CreatePostModal";
import LogoSvg from "@/features/shared/assets/Logo.svg?url";
import SessionWatcher from "@/features/auth/components/SessionWatcher";
import { PresenceSubscription } from "@/features/presence/components/PresenceSubscription";
import type { SessionData } from "@/features/me/me.type";

const leftRailAsideClass =
  "hidden md:flex sticky top-[76px] h-[calc(100vh-92px)] w-20 xl:w-[250px] shrink-0 justify-end";
const rightRailAsideClass =
  "hidden lg:flex sticky top-[76px] h-[calc(100vh-92px)] lg:w-[244px] xl:w-[250px] shrink-0 justify-start";

function LeftRailWidthSpacer() {
  return (
    <div
      className="invisible pointer-events-none h-full w-full shrink-0"
      aria-hidden
    />
  );
}

export const Layout: React.FC<{
  children: React.ReactNode;
  initialUser: SessionData | null;
}> = ({ children, initialUser }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const openRight = () => setIsRightNavOpen(true);
  const closeRight = () => setIsRightNavOpen(false);

  const user = useAppStore((s) => s.auth.user);
  const setUser = useAppStore((s) => s.setUser);
  const language = useAppStore((s) => s.settings.language);
  const initializeLanguage = useAppStore((s) => s.initializeLanguage);
  const isCreatePostModalOpen = useAppStore((s) => s.createPostModal.isOpen);
  const closeCreatePostModal = useAppStore((s) => s.closeCreatePostModal);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  useEffect(() => {
    setIsHydrated(true);
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        if (currentY < 10) {
          setIsHeaderVisible(true);
        } else if (delta > 4) {
          setIsHeaderVisible(false);
        } else if (delta < -4) {
          setIsHeaderVisible(true);
        }
        lastScrollY.current = currentY;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      <div className="w-full min-h-screen bg-page-background-default flex items-center justify-center">
        <Image src={LogoSvg} alt="Hexoo" priority className="w-44 h-auto" />
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-page-background-default w-full min-h-screen">
      <PresenceSubscription />
      <SessionWatcher />
      <div className="flex w-full max-w-[1310px] flex-col md:w-[calc(100%_-_32px)]">
        <header
          className={
            "sticky top-0 z-50 transition-transform duration-300 ease-out will-change-transform " +
            (isHeaderVisible ? "" : "max-md:-translate-y-full")
          }
        >
          <Header user={user} />
        </header>
        <div className="mx-auto w-full flex-1 md:pt-4">
          <div className="flex items-start md:gap-3">
            <aside className={leftRailAsideClass}>
              {user ? (
                <LeftNav onOpenRight={openRight} user={user} />
              ) : (
                <LeftRailWidthSpacer />
              )}
            </aside>
            <main className="flex-1 min-w-0">{children}</main>
            <aside className={rightRailAsideClass}>
              {user ? <RightNavSidebar /> : <RightNavGuestDisclaimer />}
            </aside>
          </div>
        </div>
        {user ? (
          <div className="sticky bottom-0 z-40 flex justify-center bg-page-background-default/90 py-2 backdrop-blur-xl md:hidden">
            <BottomNav onOpenRight={openRight} user={user} />
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
