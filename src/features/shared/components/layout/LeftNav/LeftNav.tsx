import Link from "next/link";
import { NavItem } from "./NavItem";
import { SessionData } from "@/features/me/me.type";
import { UserRole } from "@/features/users/types/user.type";
import {
  House,
  User,
  Settings,
  Plus,
  Shield,
  ClipboardList,
} from "lucide-react";
import Button from "@/features/shared/components/ui/Button";
import { useAppStore } from "@/lib/store/store";

type LeftNavProps = {
  onOpenRight?: () => void;
  user: SessionData | null;
};

function roleKey(role: SessionData["role"] | undefined): string {
  return String(role ?? "").toLowerCase();
}

export function LeftNav({ onOpenRight, user }: LeftNavProps) {
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);
  const r = roleKey(user?.role);
  const isAdmin = r === UserRole.Admin;
  const isModerator = r === UserRole.Moderator;
  const isStaff = isAdmin || isModerator;

  return (
    <div className="hidden md:flex md:sticky md:top-[88px] justify-end-safe self-start bg-primary-neutral-background-default border-t-2 border-primary-neutral-stroke-default  rounded-xl overflow-hidden md:w-20 xl:w-72 px-3 py-3 lg:px-4 lg:py-4 flex-col items-center h-full">
      {user ? (
        <div className="h-full py-5 gap-16 flex flex-col w-full items-center">
          <div className="flex flex-col md:justify-start items-center xl:items-start w-full xl:w-fit font-sans">
            <NavItem label={"Strona główna"} to="/" icon={House} />
            <NavItem
              label={"Twój profil"}
              to={`/profile/${user.uid}`}
              icon={User}
            />
            <NavItem label={"Ustawienia"} to="/settings" icon={Settings} />
            {isStaff ? (
              isAdmin ? (
                <>
                  <NavItem label="Panel admina" to="/admin" icon={Shield} />
                  <NavItem
                    label="Moderacja"
                    to="/moderator"
                    icon={ClipboardList}
                  />
                </>
              ) : (
                <NavItem label="Panel admina" to="/moderator" icon={Shield} />
              )
            ) : null}
          </div>

          <div className="flex w-full justify-center">
            <div className="xl:hidden">
              <Button
                size="icon"
                icon={<Plus className="size-5" />}
                onClick={openCreatePostModal}
              />
            </div>

            <div className="hidden xl:block w-full">
              <Button
                text="Dodaj post"
                size="xl"
                rightIcon={<Plus className="size-5" />}
                className="w-full justify-center font-semibold"
                onClick={openCreatePostModal}
              />
            </div>
          </div>
        </div>
      ) : null}
      <footer className="flex">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex gap-4 text-sm font-serif font-medium text-text-neutral/70">
            <Link
              href="mailto:contact@hexoo.eu"
              className="hover:text-text-neutral transition-colors"
            >
              Kontakt
            </Link>
            <span>•</span>
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
          <div className="text-xs text-text-neutral/70 font-sand">
            © 2025-2026 Hexoo Project. <br />
            Created by CHOPAPIK. <br />
            Protected by reCAPTCHA.
          </div>
        </div>
      </footer>
    </div>
  );
}
