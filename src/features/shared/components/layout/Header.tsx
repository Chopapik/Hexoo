import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import Button from "../ui/Button";
import { Logo } from "../ui/Logo";

import Link from "next/link";
import { UserSessionData } from "@/features/users/types/user.type";

export const Header = ({ user }: { user: UserSessionData | null }) => {
  return (
    <div className="h-14 w-full px-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex justify-between items-center">
      <div className="h-fit w-fit relative overflow-hidden">
        <Link href="/">
          <div className="pointer">
            <Logo />
          </div>
        </Link>
      </div>
      <div>
        {user ? (
          <>
            <span className="text-white">{user.name}</span>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button text="Zaloguj się" rightIconUrl={chevronRightUrl} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
