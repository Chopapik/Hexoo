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
    "size-10 left-0 top-0 absolute transition-colors duration-200 " +
    (isActive
      ? "text-foreground-primary-default"
      : "text-foreground-secondary-default group-hover/item:text-foreground-primary-default");

  const isSidebar = variant === "sidebar";

  const linkClasses =
    "rounded-xl inline-flex items-center group/item cursor-pointer transition-colors duration-200 " +
    (isSidebar
      ? "h-12 w-full justify-center xl:justify-start xl:gap-5"
      : "h-10 w-10 xs:w-11 sm:w-12 justify-center");

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
            "hidden xl:block w-0.5 h-12 transition-colors duration-200 " +
            (isActive
              ? "bg-foreground-primary-default"
              : "bg-foreground-secondary-default group-hover/item:bg-foreground-primary-default")
          }
        />
      ) : null}

      <div className="flex justify-start items-center gap-1 overflow-hidden">
        <div className="relative inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="size-10 relative overflow-hidden flex items-center justify-center">
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
                    ? "bg-white"
                    : "bg-foreground-secondary-default group-hover/item:bg-foreground-primary-default")
                }
              />
            )}
          </div>

          <div className="size-2 left-[16px] top-0 absolute">
            {hasNotification && (
              <div className="size-2 left-0 top-0 absolute bg-yellow-500 rounded-full ring-2 ring-surface-card-background-default" />
            )}
          </div>
        </div>

        {isSidebar ? (
          <div className="flex justify-start items-start overflow-hidden">
            <div
              className={
                "hidden xl:block text-lg font-semibold font-sans transition-colors duration-200 " +
                (isActive
                  ? "text-white drop-shadow-sm"
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
