import React from "react";
import Button from "@/features/shared/components/ui/Button";
import { NavItem } from "./NavItem";
import { Plus } from "lucide-react";
import { useAppDispatch } from "@/lib/store/hooks";
import { openCreatePostModal } from "@/features/posts/store/createPostModalSlice";

type BottomNavProps = {
  onOpenRight?: () => void;
};

export function BottomNav({ onOpenRight }: BottomNavProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex bg-primary-neutral-background-default border-t border-primary-neutral-stroke-default rounded-xl overflow-hidden h-11 px-1 w-full flex-row justify-between items-center gap-4">
      <div className="flex flex-row items-center w-full px-2">
        <NavItem label="Strona główna" to="/" />
        <NavItem label="Wiadomości" to="/messages" hasNotification />
        <NavItem label="Powiadomienia" to="/notifications" />
        <NavItem label="Twój profil" to="/profile" />
      </div>
      <Button
        size="icon"
        variant="secondary"
        icon={<Plus className="size-5" />}
        onClick={() => dispatch(openCreatePostModal())}
      />
    </div>
  );
}
