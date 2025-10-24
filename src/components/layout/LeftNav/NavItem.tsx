import React from "react";

export function NavItem({
  label,
  to,
  hasNotification = false,
}: {
  label: string;
  to: string;
  hasNotification?: boolean;
}) {
  const isActive = false; // neutral placeholder, no routing logic

  return (
    <div
      className="rounded-xl inline-flex justify-start items-center gap-5 group/item cursor-pointer"
      aria-current={isActive ? "page" : undefined}
    >
      <div
        className={
          "hidden xl:block w-0.5 h-12 " +
          (isActive
            ? "bg-text-main"
            : "bg-text-neutral group-hover/item:bg-text-main")
        }
      />
      <div className="flex justify-start items-center gap-1 overflow-hidden">
        <div className="relative inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="size-6 relative overflow-hidden">
            <div
              className={
                "size-4 left-[4px] top-[3px] absolute " +
                (isActive
                  ? "bg-text-main"
                  : "bg-text-neutral group-hover/item:bg-text-main")
              }
            />
          </div>

          <div className="size-2 left-[16px] top-0 absolute">
            {hasNotification && (
              <div className="size-2 left-0 top-0 absolute bg-yellow-500 rounded-full" />
            )}
          </div>
        </div>

        <div className="flex justify-start items-start overflow-hidden">
          <div
            className={
              "hidden xl:block text-lg font-semibold font-Albert_Sans " +
              (isActive
                ? "text-text-main"
                : "text-text-neutral group-hover/item:text-text-main")
            }
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
