import React from "react";
import { Button } from "@/components/ui/Button";
import { NavItem } from "./NavItem";

type BottomNavProps = {
  onOpenRight?: () => void;
};

export function BottomNav({ onOpenRight }: BottomNavProps) {
  return (
    <div className="flex bg-primary-neutral-background-default border-t border-primary-neutral-stroke-default rounded-xl overflow-hidden h-11 px-1 w-full flex-row justify-between items-center gap-4">
      <div className="flex flex-row items-center w-full px-2">
        <NavItem label="Strona główna" />
        <NavItem label="Wiadomości" hasNotification />
        <NavItem label="Powiadomienia" />
        <NavItem label="Twój profil" />
      </div>
      <Button size="icon" onClick={onOpenRight} />
    </div>
  );
}
