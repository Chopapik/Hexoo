import Link from "next/link";
import { NavItem } from "./NavItem";
import { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import Button from "@/features/shared/components/ui/Button";
import { useAppStore } from "@/lib/store/store";
import {
  HexActivityIcon,
  HexHomeIcon,
  HexProfileIcon,
  HexSettingsIcon,
} from "@/features/shared/components/icons/HexNavIcons";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

type LeftNavProps = {
  onOpenRight?: () => void;
  user: SessionData | null;
};

function roleKey(role: SessionData["role"] | undefined): string {
  return String(role ?? "").toLowerCase();
}

export function LeftNav({ onOpenRight, user }: LeftNavProps) {
  const { t } = useI18n();
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);
  const r = roleKey(user?.role);
  const isAdmin = r === UserRole.Admin;
  const isModerator = r === UserRole.Moderator;
  const isStaff = isAdmin || isModerator;

  return (
    <div className="hidden h-full w-full flex-col items-center justify-between md:flex xl:w-[235px]">
      {user ? (
        <div className="flex w-full flex-col items-center gap-4">
          <nav className="flex w-full flex-col items-center rounded-3xl bg-surface-chrome-background-default py-8 shadow-lg backdrop-blur-sm">
            <div className="flex w-full flex-col items-center font-sans xl:w-44 xl:items-start">
              <NavItem label={t("nav.home")} to="/" icon={HexHomeIcon} />
              <NavItem
                label={t("nav.profile")}
                to={`/profile/${user.uid}`}
                icon={HexProfileIcon}
              />
              <NavItem
                label={t("nav.settings")}
                to="/settings"
                icon={HexSettingsIcon}
              />
              {isStaff ? (
                isAdmin ? (
                  <>
                    <NavItem
                      label={t("nav.admin")}
                      to="/admin"
                      icon={HexActivityIcon}
                    />
                    <NavItem
                      label={t("nav.moderation")}
                      to="/moderator"
                      icon={HexActivityIcon}
                    />
                  </>
                ) : (
                  <NavItem
                    label={t("nav.admin")}
                    to="/moderator"
                    icon={HexActivityIcon}
                  />
                )
              ) : null}
            </div>
          </nav>

          <div className="lg:hidden">
            <Button
              size="icon"
              icon={<Plus className="size-5" />}
              onClick={openCreatePostModal}
            />
          </div>
        </div>
      ) : null}
      <footer className="hidden w-44 flex-col xl:flex">
        <div className="border-t border-surface-chrome-border-default w-full mb-3" />
        <ul className="flex flex-col items-start justify-start gap-0.5 text-left w-full font-sans">
          <li>
            <Link
              href="mailto:contact@hexoo.eu"
              className="text-xs font-medium text-foreground-muted-default transition-colors hover:text-foreground-secondary-default"
            >
              {t("nav.contact")}
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="text-xs font-medium text-foreground-muted-default transition-colors hover:text-foreground-secondary-default"
            >
              {t("nav.privacy")}
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="text-xs font-medium text-foreground-muted-default transition-colors hover:text-foreground-secondary-default"
            >
              {t("nav.terms")}
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  );
}
