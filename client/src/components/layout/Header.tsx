import chevronRightUrl from "@/assets/icons/chevronRight.svg?url";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import React from "react";
import Image from "next/image";

export const Header: React.FC = () => {
  return (
    <div className="h-14 w-full px-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex justify-between items-center">
      <div className="h-fit w-fit relative overflow-hidden">
        <Logo />
      </div>
      <Button text="Zaloguj się" rightIconUrl={chevronRightUrl} />
    </div>
  );
};
