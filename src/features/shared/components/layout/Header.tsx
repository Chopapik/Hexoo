import Link from "next/link";
import Button from "../ui/Button";
import { Logo } from "../ui/Logo";
import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import { SessionData } from "@/features/me/me.type";
import { useI18n } from "@/i18n/useI18n";

export const Header = ({ user }: { user: SessionData | null }) => {
  const { t } = useI18n();

  return (
    <div className="inline-flex h-[75px] w-full items-center justify-between border border-surface-chrome-border-default bg-surface-chrome-background-default px-8 backdrop-blur-2xl md:h-[60px] md:px-4">
      <Link
        href="/"
        aria-label="Hexoo"
        className="flex h-full items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
      >
        <Logo
          compactOnMobile={false}
          className="flex h-[25px] w-[118px] items-center"
        />
      </Link>

      <div className="flex items-center">
        {user ? (
          <Link
            href={`/profile/${user.uid}`}
            className="group flex h-11 items-center gap-3 rounded-2xl px-1.5 py-1 transition-colors duration-200 hover:bg-button-transparent-background-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 md:h-12"
          >
            <Avatar
              src={user.avatarUrl || undefined}
              alt={user.name}
              className="size-9 rounded-xl md:size-10"
            />

            <div className="hidden flex-col items-start justify-center gap-0.5 md:flex">
              <span className="font-sans text-[10px] font-medium uppercase leading-none tracking-wide text-foreground-secondary-default">
                {t("header.loggedAs")}
              </span>
              <span className="font-sans text-sm font-bold leading-none text-foreground-primary-default">
                {user.name}
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/login" prefetch={false}>
            <span className="md:hidden">
              <Button
                text={t("header.login")}
                rightIconUrl={chevronRightUrl}
                size="sm"
              />
            </span>
            <span className="hidden md:block">
              <Button
                text={t("header.login")}
                rightIconUrl={chevronRightUrl}
              />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};
