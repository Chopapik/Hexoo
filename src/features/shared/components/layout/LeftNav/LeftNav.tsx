import Link from "next/link";
import { NavItem } from "./NavItem";
import type { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import {
  ActivityIcon,
  HomeIcon,
  MessagesIcon,
  ProfileIcon,
  SettingsIcon,
} from "@/features/shared/components/icons/NavIcons";
import { useI18n } from "@/i18n/useI18n";

type LeftNavProps = {
  onOpenRight?: () => void;
  user: SessionData | null;
};

function roleKey(role: SessionData["role"] | undefined): string {
  return String(role ?? "").toLowerCase();
}

export function LeftNav({ user }: LeftNavProps) {
  const { t } = useI18n();
  const r = roleKey(user?.role);
  const isAdmin = r === UserRole.Admin;
  const isModerator = r === UserRole.Moderator;
  const isStaff = isAdmin || isModerator;

  return (
    <div className="flex h-full min-h-[720px] w-[235px] flex-col items-center justify-between rounded-xl pb-4 drop-shadow-[0px_4px_6px_rgba(0,0,0,0.25)]">
      <nav
        aria-label="Primary"
        className="flex w-full flex-col items-center overflow-hidden rounded-[24px] bg-surface-chrome-background-default py-8 shadow-lg backdrop-blur-sm"
      >
        <div className="flex w-[176px] flex-col items-start justify-center font-sans">
          <NavItem
            label={t("nav.home")}
            to="/"
            icon={HomeIcon}
            active={user ? undefined : true}
          />

          {user ? (
            <>
              <NavItem
                label={t("nav.profile")}
                to={`/profile/${encodeURIComponent(user.uid)}`}
                icon={ProfileIcon}
              />
              <NavItem
                label={t("nav.messages")}
                to="/messages"
                icon={MessagesIcon}
              />
              <NavItem
                label={t("nav.settings")}
                to="/settings"
                icon={SettingsIcon}
              />

              {isStaff ? (
                isAdmin ? (
                  <>
                    <NavItem
                      label={t("nav.admin")}
                      to="/admin"
                      icon={ActivityIcon}
                    />
                    <NavItem
                      label={t("nav.moderation")}
                      to="/moderator"
                      icon={ActivityIcon}
                    />
                  </>
                ) : (
                  <NavItem
                    label={t("nav.moderation")}
                    to="/moderator"
                    icon={ActivityIcon}
                  />
                )
              ) : null}
            </>
          ) : null}
        </div>
      </nav>

      <footer className="flex w-44 flex-col border-t border-foreground-muted-default py-2">
        <ul className="flex w-full flex-col items-start justify-start gap-0.5 text-left font-sans">
          <li>
            <Link
              href="mailto:contact@hexoo.eu"
              className="text-xs font-medium leading-4 text-foreground-muted-default transition-colors hover:text-foreground-secondary-default"
            >
              {t("nav.contact")}
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="text-xs font-medium leading-4 text-foreground-muted-default transition-colors hover:text-foreground-secondary-default"
            >
              {t("nav.privacy")}
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="text-xs font-medium leading-4 text-foreground-muted-default transition-colors hover:text-foreground-secondary-default"
            >
              {t("nav.terms")}
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  );
}
