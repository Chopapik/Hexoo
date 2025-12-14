import { ReactNode } from "react";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full p-4 md:px-6 md:py-5 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default shadow-lg">
      <h3 className="text-lg font-semibold font-Albert_Sans text-text-main mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
