"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type NavItemVariant = "sidebar" | "bottom";

export function NavItem({
  label,
  to,
  iconUrl,
  icon: Icon,
  hasNotification = false,
  variant = "sidebar",
  active,
}: {
  label: string;
  to: string;
  iconUrl?: string;
  icon?: LucideIcon | React.ElementType;
  hasNotification?: boolean;
  variant?: NavItemVariant;
  active?: boolean;
}) {
  const pathname = usePathname();

  const isPathActive =
    to === "/"
      ? pathname === "/"
      : pathname === to || pathname?.startsWith(`${to}/`);
  const isActive = active ?? isPathActive;
  const isSidebar = variant === "sidebar";

  const iconClasses =
    "size-6 shrink-0 transition-colors duration-200 " +
    (isActive
      ? "text-foreground-primary-default"
      : "text-foreground-secondary-default group-hover/item:text-foreground-primary-default");

  const linkClasses =
    "group/item relative inline-flex items-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60 " +
    (isSidebar ? "h-12 w-[176px] justify-start" : "size-[30px] justify-center");

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

      <div
        className={
          isSidebar
            ? "ml-[34px] flex items-center justify-start gap-2 overflow-hidden"
            : "flex items-center justify-center overflow-hidden"
        }
      >
        <div className="relative inline-flex flex-col items-start justify-start overflow-hidden">
          <div className="relative flex size-[30px] items-center justify-center overflow-hidden">
            {Icon ? (
              (() => {
                const I = Icon as LucideIcon;
                return (
                  <I className={iconClasses} strokeWidth={2} fill="none" />
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
                  "absolute left-[4px] top-[3px] size-4 " +
                  (isActive
                    ? "bg-foreground-primary-default"
                    : "bg-foreground-secondary-default group-hover/item:bg-foreground-primary-default")
                }
              />
            )}
          </div>

          {hasNotification ? (
            <div className="absolute left-[11px] top-0 size-2 rounded-full bg-yellow-500 ring-2 ring-surface-chrome-background-default" />
          ) : null}
        </div>

        {isSidebar ? (
          <div className="flex items-start justify-start overflow-hidden">
            <span
              className={
                "block whitespace-nowrap font-sans text-lg font-semibold leading-[1.2] transition-colors duration-200 " +
                (isActive
                  ? "text-foreground-primary-default drop-shadow-sm"
                  : "text-foreground-secondary-default group-hover/item:text-foreground-primary-default")
              }
            >
              {label}
            </span>
          </div>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    </Link>
  );
}
