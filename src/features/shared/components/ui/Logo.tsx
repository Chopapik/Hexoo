import Image from "next/image";
import LogoSvg from "@/features/shared/assets/Logo.svg?url";
import LogoSmSvg from "@/features/shared/assets/LogoSm.svg?url";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="hidden h-full sm:block">
        <Image src={LogoSvg} alt="Hexoo" className="h-full w-auto" />
      </div>
      <div className="h-full sm:hidden">
        <Image src={LogoSmSvg} alt="Hexoo" className="h-full w-auto" />
      </div>
    </div>
  );
}
