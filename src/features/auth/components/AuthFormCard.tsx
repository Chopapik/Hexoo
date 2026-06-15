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
    <div className="mx-auto inline-flex min-h-[800px] w-full max-w-md flex-col items-center justify-center gap-6 overflow-hidden px-4 py-12 md:max-w-2xl md:gap-10 md:rounded-[20px] md:border md:border-surface-card-border-default md:bg-surface-card-background-default md:px-32 md:py-20">
      <div className="flex flex-col items-center justify-start overflow-hidden py-0.5">
        <div className="justify-start font-serif text-4xl text-foreground-primary-default md:text-6xl">
          {title}
        </div>
        {subtitle && (
          <div className="justify-start font-serif text-xl font-bold text-foreground-secondary-default md:text-2xl">
            {subtitle}
          </div>
        )}
      </div>

      {children}

      <div className="mt-2 self-stretch justify-start text-center md:mt-4">
        <span className="font-sans text-sm font-semibold text-foreground-primary-default">
          {footerText}
        </span>
        <span className="ml-1 font-sans text-sm font-semibold text-foreground-primary-default underline">
          <Link
            href={footerLinkHref}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default"
          >
            {footerLinkText}
          </Link>
        </span>
      </div>
    </div>
  );
}
