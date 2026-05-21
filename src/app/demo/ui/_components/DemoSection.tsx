import type { ReactNode } from "react";

export function DemoSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="space-y-5 rounded-lg border border-primary-neutral-stroke-default bg-primary-neutral-background-default/70 p-4 shadow-2xl shadow-black/20 sm:p-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-text-main font-sans sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-neutral mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
