import { ReactNode } from "react";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full rounded-xl border border-surface-card-border-default bg-surface-card-background-default p-3 font-sans md:p-4">
      <h3 className="mb-3 font-serif text-xl font-bold text-foreground-primary-default md:mb-4 md:text-2xl">
        {title}
      </h3>
      <div className="flex flex-col gap-3 md:gap-4">{children}</div>
    </section>
  );
}
