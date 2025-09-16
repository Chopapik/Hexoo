import { Button } from "@/components/ui/Button";
import React from "react";
import { NavItem } from "./NavItem";

type LeftNavProps = {
  onOpenRight?: () => void;
};

export function LeftNav({ onOpenRight }: LeftNavProps) {
  return (
    <div className="hidden md:flex md:sticky md:top-[88px] self-start bg-primary-neutral-background-default border-t border-primary-neutral-stroke-default rounded-xl overflow-hidden md:w-20 xl:w-72 px-3 py-3 lg:px-4 lg:py-8 flex-col justify-between h-full">
      {/* nav items */}
      <div className="flex flex-col md:justify-start items-start lg:gap-8 w-full">
        <NavItem label="Strona główna" active />
        <NavItem label="Wiadomości" hasNotification={true} />
        <NavItem label="Powiadomienia" hasNotification={true} />
        <NavItem label="Twój profil" />
      </div>
      <div className="hidden xl:block">
        <Button size="xl" onClick={onOpenRight} />
      </div>
    </div>
  );
}
