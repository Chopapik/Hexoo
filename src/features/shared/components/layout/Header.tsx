import chevronRightUrl from "@/features/shared/assets/icons/chevronRight.svg?url";
import Button from "../ui/Button";
import { Logo } from "../ui/Logo";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import useLogout from "@/features/auth/hooks/useLogout";

export const Header: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { handleLogout } = useLogout();

  return (
    <div className="h-14 w-full px-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex justify-between items-center">
      <div className="h-fit w-fit relative overflow-hidden">
        <Logo />
      </div>
      <div>
        {user ? (
          <>
            <span className="text-white">{user.email}</span>
            <button onClick={handleLogout}> wyloguj</button>
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
