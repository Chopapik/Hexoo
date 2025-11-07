import React from "react";
import Button from "@/features/shared/components/ui/Button";
import { NavItem } from "./NavItem";

type BottomNavProps = {
  onOpenRight?: () => void;
};

export function BottomNav({ onOpenRight }: BottomNavProps) {
  return (
    <div className="flex bg-primary-neutral-background-default border-t border-primary-neutral-stroke-default rounded-xl overflow-hidden h-11 px-1 w-full flex-row justify-between items-center gap-4">
      <div className="flex flex-row items-center w-full px-2">
        <NavItem label="Strona główna" to="/" />
        <NavItem label="Wiadomości" to="/messages" hasNotification />
        <NavItem label="Powiadomienia" to="/notifications" />
        <NavItem label="Twój profil" to="/profile" />
      </div>
      <Button size="icon" onClick={onOpenRight} />
    </div>
  );
}
