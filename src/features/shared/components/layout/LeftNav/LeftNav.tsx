import Link from "next/link";
import { NavItem } from "./NavItem";
import { SessionData } from "@/features/me/me.type";
import { House, MessageCircle, Bell, User, Settings } from "lucide-react";

type LeftNavProps = {
  onOpenRight?: () => void;
  user: SessionData | null;
};

export function LeftNav({ onOpenRight, user }: LeftNavProps) {
  return (
    <div className="hidden md:flex md:sticky md:top-[88px] justify-end-safe self-start bg-primary-neutral-background-default border-t-2 border-primary-neutral-stroke-default  rounded-xl overflow-hidden md:w-20 xl:w-72 px-3 py-3 lg:px-4 lg:py-4 flex-col items-center h-full">
      {user ? (
        <div className="h-full py-5 gap-12 flex flex-col">
          <div className="flex flex-col md:justify-start items-start w-fit font-Plus_Jakarta_Sans gap-2">
            <NavItem label={"Strona główna"} to="/" icon={House} />
            <NavItem
              label={"Twój profil"}
              to={`/profile/${user.name}`}
              icon={User}
            />
            <NavItem label={"Ustawienia"} to="/settings" icon={Settings} />
          </div>
        </div>
      ) : (
        <></>
      )}
      <footer className="flex">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex gap-4 text-xs font-medium text-text-neutral/60">
            <Link
              href="/privacy"
              className="hover:text-text-neutral transition-colors"
            >
              Prywatność i Cookies
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-text-neutral transition-colors"
            >
              Regulamin
            </Link>
          </div>
          <div className="text-[10px] text-text-neutral/40 font-mono">
            © 2025-2026 Hexoo Project. Created by CHOPAPIK. Protected by
            reCAPTCHA.
          </div>
        </div>
      </footer>
    </div>
  );
}
