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
    "size-5 left-[2px] top-[2px] absolute transition-colors duration-200 " +
    (isActive
      ? "text-text-main"
      : "text-text-neutral group-hover/item:text-text-main");

  const isSidebar = variant === "sidebar";

  const linkClasses =
    "rounded-xl inline-flex items-center group/item cursor-pointer transition-colors duration-200 " +
    (isSidebar
      ? "h-12 w-full justify-center xl:justify-start xl:gap-5"
      : "h-10 w-12 justify-center");

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
              ? "bg-text-main"
              : "bg-text-neutral group-hover/item:bg-text-main")
          }
        />
      ) : null}

      <div className="flex justify-start items-center gap-1 overflow-hidden">
        <div className="relative inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="size-6 relative overflow-hidden flex items-center justify-center">
            {Icon ? (
              (() => {
                const I = Icon as LucideIcon;
                return (
                  <I
                    className={iconClasses}
                    strokeWidth={isActive ? 2.5 : 2}
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
                    : "bg-text-neutral group-hover/item:bg-text-main")
                }
              />
            )}
          </div>

          <div className="size-2 left-[16px] top-0 absolute">
            {hasNotification && (
              <div className="size-2 left-0 top-0 absolute bg-yellow-500 rounded-full ring-2 ring-primary-neutral-background-default" />
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
                  : "text-text-neutral group-hover/item:text-text-main")
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
