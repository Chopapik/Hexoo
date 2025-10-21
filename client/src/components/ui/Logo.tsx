import Image from "next/image";
import LogoSvg from "@/assets/Logo.svg?url";
import LogoSmSvg from "@/assets/LogoSm.svg?url";

export function Logo() {
  return (
    <>
      <div className="hidden sm:block">
        <Image src={LogoSvg} alt="Hexoo" />
      </div>
      <div className="sm:hidden">
        <Image src={LogoSmSvg} alt="Hexoo" />
      </div>
    </>
  );
}
