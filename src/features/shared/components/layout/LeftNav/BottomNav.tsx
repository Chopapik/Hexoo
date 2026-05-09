import Button from "@/features/shared/components/ui/Button";
import { NavItem } from "./NavItem";
import {
  House,
  User,
  Settings,
  Plus,
  Shield,
  ClipboardList,
} from "lucide-react";
import { useAppStore } from "@/lib/store/store";
import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";

type BottomNavProps = {
  onOpenRight?: () => void;
  user: SessionData;
};

function roleKey(role: SessionData["role"] | undefined): string {
  return String(role ?? "").toLowerCase();
}

export function BottomNav({ user }: BottomNavProps) {
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  const r = roleKey(user?.role);
  const isAdmin = r === UserRole.Admin;
  const isModerator = r === UserRole.Moderator;
  const isStaff = isAdmin || isModerator;

  return (
    <div className="flex bg-primary-neutral-background-default border-t border-primary-neutral-stroke-default rounded-xl overflow-hidden h-11 px-1 w-full flex-row justify-between items-center gap-2">
      <div className="flex flex-row items-center min-w-0 px-2">
        <NavItem label="Strona główna" to="/" icon={House} variant="bottom" />

        <NavItem
          label="Twój profil"
          to={`/profile/${user.uid}`}
          icon={User}
          variant="bottom"
        />

        <NavItem
          label="Ustawienia"
          to="/settings"
          icon={Settings}
          variant="bottom"
        />

        {isStaff ? (
          isAdmin ? (
            <>
              <NavItem
                label="Panel admina"
                to="/admin"
                icon={Shield}
                variant="bottom"
              />

              <NavItem
                label="Moderacja"
                to="/moderator"
                icon={ClipboardList}
                variant="bottom"
              />
            </>
          ) : (
            <NavItem
              label="Panel admina"
              to="/moderator"
              icon={Shield}
              variant="bottom"
            />
          )
        ) : null}
      </div>

      <Button
        size="icon"
        icon={<Plus className="size-5" />}
        className="shrink-0"
        onClick={openCreatePostModal}
      />
    </div>
  );
}
