import Button from "@/features/shared/components/ui/Button";
import { NavItem } from "./NavItem";
import { useAppStore } from "@/lib/store/store";
import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import {
  HexActivityIcon,
  HexCreateIcon,
  HexHomeIcon,
  HexProfileIcon,
  HexSettingsIcon,
} from "@/features/shared/components/icons/HexNavIcons";
import { useI18n } from "@/i18n/useI18n";

type BottomNavProps = {
  onOpenRight?: () => void;
  user: SessionData;
};

function roleKey(role: SessionData["role"] | undefined): string {
  return String(role ?? "").toLowerCase();
}

export function BottomNav({ user }: BottomNavProps) {
  const { t } = useI18n();
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  const r = roleKey(user?.role);
  const isAdmin = r === UserRole.Admin;
  const isModerator = r === UserRole.Moderator;
  const isStaff = isAdmin || isModerator;

  return (
    <nav className="flex h-[58px] w-[290px] max-w-[calc(100%_-_32px)] flex-row items-center justify-between overflow-hidden rounded-[32px] bg-surface-chrome-background-default p-2 shadow-lg backdrop-blur-sm">
      <div className="flex h-[42px] min-w-0 flex-row items-center gap-4 rounded-3xl px-1.5">
        <NavItem
          label={t("nav.home")}
          to="/"
          icon={HexHomeIcon}
          variant="bottom"
        />

        <NavItem
          label={t("nav.profile")}
          to={`/profile/${user.uid}`}
          icon={HexProfileIcon}
          variant="bottom"
        />

        <NavItem
          label={t("nav.settings")}
          to="/settings"
          icon={HexSettingsIcon}
          variant="bottom"
        />

        {isStaff ? (
          isAdmin ? (
            <>
              <NavItem
                label={t("nav.admin")}
                to="/admin"
                icon={HexActivityIcon}
                variant="bottom"
              />

              <NavItem
                label={t("nav.moderation")}
                to="/moderator"
                icon={HexActivityIcon}
                variant="bottom"
              />
            </>
          ) : (
            <NavItem
              label={t("nav.admin")}
              to="/moderator"
              icon={HexActivityIcon}
              variant="bottom"
            />
          )
        ) : null}
      </div>

      <Button
        size="icon"
        icon={<HexCreateIcon className="size-10" />}
        className="shrink-0"
        onClick={openCreatePostModal}
      />
    </nav>
  );
}
