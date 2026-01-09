"use client";

import { useEffect, useState } from "react";
import { Header } from "./Header";
import { LeftNav } from "./LeftNav/LeftNav";
import { BottomNav } from "./LeftNav/BottomNav";
import { RightNavSidebar, RightNavOverlay } from "./RightNav/RightNav";
import { setUser, setReady } from "@/features/auth/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { SessionData } from "@/features/me/me.type";

export const Layout: React.FC<{
  children: React.ReactNode;
  user: SessionData | null;
}> = ({ children, user }) => {
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);
  const openRight = () => setIsRightNavOpen(true);
  const closeRight = () => setIsRightNavOpen(false);

  const dispatch = useAppDispatch();

  const { user: userFromStore, ready } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(setUser(user));
    dispatch(setReady(true));
  }, [user, dispatch]);

  const effectiveUser = ready ? userFromStore : user;

  return (
    <div className="flex justify-center bg-page-background w-full min-h-screen">
      <div className="flex flex-col w-full max-w-[1440px]">
        <header className="sticky top-0 z-50 bg-page-background px-2 py-2 md:px-4 md:py-4">
          <div className="mx-auto w-full">
            <Header user={effectiveUser} />
          </div>
        </header>
        <div className="mx-auto w-full px-2 md:px-4 flex-1">
          <div className="flex gap-4 items-start">
            <aside className="hidden md:block sticky top-[calc(56.6px+16px+16px)] h-[calc(100vh-56.6px-16px-16px-16px)]">
              <LeftNav onOpenRight={openRight} user={effectiveUser} />
            </aside>
            <main className="flex-1 min-w-0">{children}</main>
            <aside className="hidden lg:block sticky top-[calc(56.6px+16px+16px)] h-[calc(100vh-56.6px-16px-16px-16px)]">
              <RightNavSidebar />
            </aside>
          </div>
        </div>
        <div className="md:hidden sticky bottom-0 px-2 pb-2 bg-page-background">
          <div className="mx-auto w-full pt-2">
            <BottomNav onOpenRight={openRight} />
          </div>
        </div>
        <RightNavOverlay open={isRightNavOpen} onClose={closeRight} />
      </div>
    </div>
  );
};
