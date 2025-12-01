import Link from "next/link";
import { UserSessionData } from "@/features/users/types/user.type";
import Button from "../ui/Button";
import { Logo } from "../ui/Logo";
import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import { Avatar } from "@/features/posts/components/Avatar";

export const Header = ({ user }: { user: UserSessionData | null }) => {
  return (
    <div className="h-14 w-full px-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex justify-between items-center shadow-lg">
      <Link
        href="/"
        className="block h-fit w-fit transition-transform duration-200"
      >
        <Logo />
      </Link>

      <div>
        {user ? (
          <Link href={`/${user.name}`}>
            <div
              className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl 
                         border border-transparent hover:border-white/10 
                         hover:bg-white/5 transition-all duration-200 cursor-pointer group"
            >
              {/* Avatar */}
              <div className="transform transition-transform duration-200">
                <Avatar src={user.avatarUrl || undefined} alt={user.name} />
              </div>

              {/* Tekst */}
              <div className="flex flex-col justify-center items-start">
                <span className="text-[10px] leading-none text-text-neutral font-medium tracking-wide uppercase mb-0.5">
                  Zalogowany jako
                </span>
                <span className="text-sm leading-none font-bold text-text-main font-Albert_Sans group-hover:text-fuchsia-400 transition-colors">
                  {user.name}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <Link href="/login">
            <Button text="Zaloguj się" rightIconUrl={chevronRightUrl} />
          </Link>
        )}
      </div>
    </div>
  );
};
