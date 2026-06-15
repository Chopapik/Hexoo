import Image from "next/image";
import LogoSvg from "@/features/shared/assets/Logo.svg?url";
import LogoSmSvg from "@/features/shared/assets/LogoSm.svg?url";

export function Logo({
  className = "",
  compactOnMobile = true,
}: {
  className?: string;
  compactOnMobile?: boolean;
}) {
  return (
    <div className={className}>
      <div className={compactOnMobile ? "hidden h-full sm:block" : "h-full"}>
        <Image src={LogoSvg} alt="Hexoo" className="h-full w-auto" />
      </div>
      {compactOnMobile ? (
        <div className="h-full sm:hidden">
          <Image src={LogoSmSvg} alt="Hexoo" className="h-full w-auto" />
        </div>
      ) : null}
    </div>
  );
}
