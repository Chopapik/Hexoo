import LogoSvg from "@/assets/Logo.svg?react";
import LogoSmSvg from "@/assets/LogoSm.svg?react";

export function Logo() {
  return (
    <>
      <div className="hidden sm:block">
        <LogoSvg />
      </div>
      <div className="sm:hidden">
        <LogoSmSvg />
      </div>
    </>
  );
}
