import Link from "next/link";
import React from "react";

interface LegalPageWrapperProps {
  children: React.ReactNode;
}

export const LegalPageWrapper = ({ children }: LegalPageWrapperProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto pt-2 pb-16 px-4 flex flex-col items-center">
      <div className="glass-card w-full p-8 md:p-12 rounded-2xl border border-primary-neutral-stroke-default bg-black/20 backdrop-blur-sm">
        <article className="prose prose-invert prose-headings:font-Albert_Sans prose-headings:text-text-main prose-p:text-text-neutral prose-li:text-text-neutral prose-a:text-fuchsia-400 hover:prose-a:text-fuchsia-300 max-w-none">
          {children}
        </article>
      </div>

      <div className="pt-8">
        <Link
          href="/"
          className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium flex items-center gap-2"
        >
          <span>&larr;</span> Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
};
