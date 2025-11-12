import React, { useEffect } from "react";
import Link from "next/link";
import { NavItem } from "./NavItem";
import { useAppSelector } from "@/lib/store/hooks";
import { UserSessionData } from "@/features/users/types/user.type";

type LeftNavProps = {
  onOpenRight?: () => void;
  user: UserSessionData | null;
};

export function LeftNav({ onOpenRight, user }: LeftNavProps) {
  return (
    <div className="hidden md:flex md:sticky md:top-[88px] self-start bg-primary-neutral-background-default border-t-2 border-primary-neutral-stroke-default rounded-xl overflow-hidden md:w-20 xl:w-72 px-3 py-3 lg:px-4 lg:py-8 flex-col items-center h-full">
      {user ? (
        <>
          <div className="flex flex-col md:justify-start items-start w-fit font-Plus_Jakarta_Sans group">
            <Link href="/">
              <NavItem label={"Strona główna"} to="/" />
            </Link>
            <Link href="/messages">
              <NavItem
                label={"Wiadomości"}
                to="/messages"
                hasNotification={true}
              />
            </Link>
            <Link href="/notifications">
              <NavItem
                label={"Powiadomienia"}
                to="/notifications"
                hasNotification={false}
              />
            </Link>
            <Link href={`/${user.name}`}>
              <NavItem label={"Twój profil"} to="/profile" />
            </Link>
          </div>
          {/* <div className="hidden xl:block">
        <Button size="xl" onClick={onOpenRight} />
      </div> */}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
