export function NavItem({
  label,
  hasNotification = false,
}: {
  label: string;
  active?: boolean;
  hasNotification?: boolean;
}) {
  return (
    <div
      className="rounded-xl inline-flex justify-start items-center gap-5 group/item cursor-pointer"
      // onClick={() => ()}
    >
      <div className="w-0.5 h-12 bg-text-neutral group-hover/item:bg-text-main" />
      <div className="flex justify-start items-center gap-1 overflow-hidden">
        <div className="relative inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="size-6 relative overflow-hidden">
            <div className="size-4 left-[4px] top-[3px] absolute bg-text-neutral group-hover/item:bg-text-main" />
          </div>

          <div className="size-2 left-[16px] top-0 absolute">
            {hasNotification && (
              <div className="size-2 left-0 top-0 absolute bg-yellow-500 rounded-full" />
            )}
          </div>
        </div>

        <div className="flex justify-start items-start overflow-hidden">
          <div className="text-text-neutral group-hover/item:text-text-main text-lg font-semibold font-Albert_Sans">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
