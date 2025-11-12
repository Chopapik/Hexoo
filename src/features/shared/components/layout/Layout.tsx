"use client";

import { useState } from "react";
import { Header } from "./Header";
import { LeftNav } from "./LeftNav/LeftNav";
import { BottomNav } from "./LeftNav/BottomNav";
import { RightNavSidebar, RightNavOverlay } from "./RightNav/RightNav";
import { UserSessionData } from "@/features/users/types/user.type";

export const Layout: React.FC<{
  children: React.ReactNode;
  user: UserSessionData | null;
}> = ({ children, user }) => {
  const [isRightNavOpen, setIsRightNavOpen] = useState(false);
  const openRight = () => setIsRightNavOpen(true);
  const closeRight = () => setIsRightNavOpen(false);

  return (
    <div className="flex justify-center bg-page-background w-full min-h-screen">
      <div className="flex flex-col w-full max-w-[1440px]">
        {/* Header pinned to top */}
        <header className="sticky top-0 z-50 bg-page-background px-2 py-2 md:px-4 md:py-4">
          <div className="mx-auto w-full">
            <Header user={user} />
          </div>
        </header>

        {/* Main content below header */}
        <div className="mx-auto w-full px-2 md:px-4 flex-1">
          <div className="flex gap-4 items-start">
            {/* LeftNav sticky */}
            <aside className="hidden md:block sticky top-[calc(56.6px+16px+16px)] h-[calc(100vh-56.6px-16px-16px-16px)]">
              <LeftNav onOpenRight={openRight} user={user} />
            </aside>

            {/* Center */}
            <main className="flex-1 min-w-0">{children}</main>

            {/* RightNav sticky */}
            <aside className="hidden lg:block sticky top-[calc(56.6px+16px+16px)] h-[calc(100vh-56.6px-16px-16px-16px)]">
              <RightNavSidebar />
            </aside>
          </div>
        </div>

        {/* BottomNav (mobile only) */}
        <div className="md:hidden sticky bottom-0 px-2 pb-2 bg-page-background">
          <div className="mx-auto w-full pt-2">
            <BottomNav onOpenRight={openRight} />
          </div>
        </div>

        {/* Right side overlay (mobile) */}
        <RightNavOverlay open={isRightNavOpen} onClose={closeRight} />
      </div>
    </div>
  );
};
