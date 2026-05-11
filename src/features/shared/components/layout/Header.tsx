import Link from "next/link";
import Button from "../ui/Button";
import { Logo } from "../ui/Logo";
import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import { SessionData } from "@/features/me/me.type";

export const Header = ({ user }: { user: SessionData | null }) => {
  return (
    <div className="h-12 md:h-14 w-full bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex justify-between items-center shadow-lg">
      <Link
        href="/"
        className="h-full flex items-center transition-transform duration-200 pl-3 md:pl-4"
        style={{ paddingTop: 0, paddingBottom: 0 }}
      >
        <Logo className="h-full w-auto flex items-center p-2.5 md:p-3 " />
      </Link>

      <div>
        {user ? (
          <Link href={`/profile/${user.uid}`}>
            <div className="flex items-center gap-2 md:gap-3 pl-1 pr-3 md:pl-1.5 md:pr-4 py-1 rounded-2xl border border-transparent hover:bg-white/5 transition-all duration-200 cursor-pointer group">
              <div className="transform transition-transform duration-200">
                <Avatar src={user.avatarUrl || undefined} alt={user.name} />
              </div>

              <div className="hidden xs:flex flex-col justify-center items-start">
                <span className="text-[10px] leading-none text-text-neutral font-sans font-medium tracking-wide uppercase mb-0.5">
                  Zalogowany jako
                </span>
                <span className="text-sm leading-none font-bold text-text-main font-sans  transition-colors">
                  {user.name}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="mr-4">
            <Link href="/login">
              <Button text="Zaloguj się" rightIconUrl={chevronRightUrl} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
