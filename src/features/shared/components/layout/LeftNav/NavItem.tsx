"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

type NavItemVariant = "sidebar" | "bottom";

export function NavItem({
  label,
  to,
  iconUrl,
  icon: Icon,
  hasNotification = false,
  variant = "sidebar",
}: {
  label: string;
  to: string;
  iconUrl?: string;
  icon?: LucideIcon | React.ElementType;
  hasNotification?: boolean;
  variant?: NavItemVariant;
}) {
  const pathname = usePathname();

  const isActive =
    to === "/"
      ? pathname === "/"
      : pathname === to || pathname?.startsWith(`${to}/`);

  const iconClasses =
    "absolute left-0 top-0 size-[30px] transition-colors duration-200 " +
    (isActive
      ? "text-foreground-primary-default"
      : "text-foreground-secondary-default group-hover/item:text-foreground-primary-default");

  const isSidebar = variant === "sidebar";

  const linkClasses =
    "group/item relative inline-flex items-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 " +
    (isSidebar
      ? "h-12 w-full justify-center xl:justify-start"
      : "size-[30px] justify-center");

  return (
    <Link
      href={to}
      className={linkClasses}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
    >
      {isSidebar ? (
        <div
          className={
            "absolute left-0 top-0 h-12 w-0.5 transition-colors duration-200 " +
            (isActive
              ? "bg-foreground-primary-default"
              : "bg-foreground-secondary-default group-hover/item:bg-foreground-primary-default")
          }
        />
      ) : null}

      <div className="flex items-center justify-start gap-2 overflow-hidden xl:ml-[34px]">
        <div className="relative inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="relative flex size-[30px] items-center justify-center overflow-hidden">
            {Icon ? (
              (() => {
                const I = Icon as LucideIcon;
                return (
                  <I
                    className={iconClasses}
                    strokeWidth={isActive ? 0.9 : 0.75}
                    fill={isActive ? "currentColor" : "none"}
                  />
                );
              })()
            ) : iconUrl ? (
              <Image
                src={iconUrl}
                alt={label}
                width={24}
                height={24}
                className={iconClasses}
              />
            ) : (
              <div
                className={
                  "size-4 left-[4px] top-[3px] absolute " +
                  (isActive
                    ? "bg-foreground-primary-default"
                    : "bg-foreground-secondary-default group-hover/item:bg-foreground-primary-default")
                }
              />
            )}
          </div>

          <div className="absolute left-[11px] top-0 size-2">
            {hasNotification && (
              <div className="size-2 left-0 top-0 absolute bg-yellow-500 rounded-full ring-2 ring-surface-chrome-background-default" />
            )}
          </div>
        </div>

        {isSidebar ? (
          <div className="flex justify-start items-start overflow-hidden">
            <div
              className={
                "hidden font-sans text-base font-semibold transition-colors duration-200 xl:block " +
                (isActive
                  ? "text-foreground-primary-default drop-shadow-sm"
                  : "text-foreground-secondary-default group-hover/item:text-foreground-primary-default")
              }
            >
              {label}
            </div>
          </div>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    </Link>
  );
}
