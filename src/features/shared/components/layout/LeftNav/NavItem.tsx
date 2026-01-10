"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

export function NavItem({
  label,
  to,
  iconUrl,
  icon: Icon,
  hasNotification = false,
}: {
  label: string;
  to: string;
  iconUrl?: string;
  icon?: LucideIcon | React.ElementType;
  hasNotification?: boolean;
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

  return (
    <Link
      href={to}
      className="rounded-xl inline-flex justify-start items-center gap-5 group/item cursor-pointer"
      aria-current={isActive ? "page" : undefined}
    >
      <div
        className={
          "hidden xl:block w-0.5 h-12 transition-colors duration-200 " +
          (isActive
            ? "bg-text-main"
            : "bg-text-neutral group-hover/item:bg-text-main")
        }
      />

      <div className="flex justify-start items-center gap-1 overflow-hidden">
        <div className="relative inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="size-6 relative overflow-hidden flex items-center justify-center">
            {Icon ? (
              <Icon
                className={iconClasses}
                strokeWidth={isActive ? 2.5 : 2}
                fill={isActive ? "currentColor" : "none"}
              />
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

        <div className="flex justify-start items-start overflow-hidden">
          <div
            className={
              "hidden xl:block text-lg font-semibold font-Albert_Sans transition-colors duration-200 " +
              (isActive
                ? "text-white drop-shadow-sm" // Tekst też lekko podbijamy
                : "text-text-neutral group-hover/item:text-text-main")
            }
          >
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}
