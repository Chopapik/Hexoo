export function NavItem({
  label,
  active = false,
  hasNotification = false,
}: {
  label: string;
  active?: boolean;
  hasNotification?: boolean;
}) {
  return (
    <></>
    // <div
    //   className={`
    //     flex items-center gap-3 p-2 rounded-xl
    //     ${active ? "bg-primary-neutral-background-hover" : ""}
    //   `}
    // >
    //   <div className="relative size-6">
    //     <div className="size-4 bg-text-neutral absolute left-1 top-1" />
    //     {hasNotification && (
    //       <div className="size-2 bg-yellow-500 rounded-full absolute right-0 top-0" />
    //     )}
    //   </div>
    //   <span
    //     className={`
    //       text-text-neutral text-lg font-semibold
    //       hidden ${showLabel}:inline
    //     `}
    //   >
    //     {label}
    //   </span>
    // </div>
  );
}
