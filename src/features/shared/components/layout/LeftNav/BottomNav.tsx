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
    <div className="flex bg-surface-chrome-background-default border-t border-surface-chrome-border-default rounded-xl overflow-hidden h-11 px-1 w-full flex-row justify-between items-center gap-1.5">
      <div className="flex flex-row items-center min-w-0 px-1">
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
    </div>
  );
}
