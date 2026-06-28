import Link from "next/link";
import Button from "../ui/Button";
import { Logo } from "../ui/Logo";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import { SessionData } from "@/features/me/me.type";
import { useI18n } from "@/i18n/useI18n";
import { LogIn } from "lucide-react";

export const Header = ({ user }: { user: SessionData | null }) => {
  const { t } = useI18n();

  return (
    <div className="flex h-[100px] w-full items-center justify-between overflow-hidden border-b border-surface-chrome-border-default bg-surface-chrome-background-default px-8 backdrop-blur-lg md:h-auto md:justify-center md:px-4 md:py-2">
      <div className="flex min-w-0 flex-1 items-center justify-between md:max-w-[1350px]">
        <Link
          href="/"
          aria-label="Hexoo"
          className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
        >
          <Logo
            size="compact"
            className="flex h-[25px] w-[32px] items-center md:hidden"
          />
          <Logo
            size="default"
            className="hidden h-[25px] w-[118px] items-center md:flex"
          />
        </Link>

        <div className="flex shrink-0 items-center">
          {user ? (
            <Link
              href={`/profile/${user.uid}`}
              className="group flex shrink-0 items-center overflow-hidden rounded-2xl border border-transparent bg-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 md:gap-3"
            >
              <Avatar
                src={user.avatarUrl || undefined}
                alt={user.name}
                className="size-12 md:size-10 rounded-xl"
              />

              <div className="hidden min-h-[30px] flex-col items-start justify-center gap-0.5 overflow-hidden whitespace-nowrap leading-none md:flex">
                <span className="shrink-0 font-sans text-[10px] font-medium leading-none text-foreground-secondary-default">
                  {t("header.loggedAs")}
                </span>
                <span className="shrink-0 font-sans text-sm font-bold leading-none text-foreground-primary-default">
                  {user.name}
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/login" prefetch={false}>
              <span className="md:hidden">
                <Button
                  aria-label={t("header.login")}
                  icon={<LogIn className="size-4" />}
                  iconOnly
                />
              </span>
              <span className="hidden md:block">
                <Button
                  text={t("header.login")}
                  rightIcon={<LogIn className="size-4" />}
                />
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
