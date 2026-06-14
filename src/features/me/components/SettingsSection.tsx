import { ReactNode } from "react";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full p-3 sm:p-4 md:px-6 md:py-5 bg-surface-card-background-default rounded-xl border-t-2 border-surface-card-border-default shadow-lg font-sans">
      <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground-primary-default mb-3 sm:mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-3 sm:gap-4">{children}</div>
    </div>
  );
}
