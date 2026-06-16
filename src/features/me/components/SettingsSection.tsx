import { ReactNode } from "react";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-[120px] w-full flex-col items-start gap-3 overflow-hidden rounded-xl border-t-2 border-surface-card-border-default bg-surface-card-background-default p-3 font-sans md:gap-4 md:p-4">
      <h3 className="w-full font-serif text-xl font-bold leading-7 text-foreground-primary-default md:text-2xl md:leading-8">
        {title}
      </h3>
      <div className="flex w-full flex-col gap-3 md:gap-4">{children}</div>
    </section>
  );
}
