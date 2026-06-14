import Link from "next/link";
import type { ReactNode } from "react";

type AuthFormCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footerText: ReactNode;
  footerLinkHref: string;
  footerLinkText: ReactNode;
};

export default function AuthFormCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkHref,
  footerLinkText,
}: AuthFormCardProps) {
  return (
    <div className="mx-auto inline-flex w-full max-w-md flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8 xs:px-6 sm:max-w-2xl sm:gap-10 sm:rounded-[20px] sm:px-12 sm:py-12 sm:glass-card md:px-32 md:py-20">
      <div className="py-0.5 flex flex-col justify-start items-center overflow-hidden">
        <div className="justify-start text-foreground-primary-default text-4xl sm:text-6xl font-serif">
          {title}
        </div>
        {subtitle && (
          <div className="justify-start text-foreground-secondary-default text-lg sm:text-2xl font-bold font-serif">
            {subtitle}
          </div>
        )}
      </div>

      {children}

      <div className="self-stretch text-center justify-start mt-2 sm:mt-4">
        <span className="text-foreground-primary-default text-sm sm:text-base font-semibold font-sans">
          {footerText}
        </span>
        <span className="text-foreground-primary-default text-sm sm:text-base font-semibold font-sans underline ml-1">
          <Link href={footerLinkHref}>{footerLinkText}</Link>
        </span>
      </div>
    </div>
  );
}
