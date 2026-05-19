import Link from "next/link";
import React from "react";
import { useI18n } from "@/i18n/useI18n";
import LanguageSwitch from "@/features/shared/components/i18n/LanguageSwitch";

interface LegalPageWrapperProps {
  children: React.ReactNode;
}

export const LegalPageWrapper = ({ children }: LegalPageWrapperProps) => {
  const { t } = useI18n();

  return (
    <div className="w-full max-w-4xl mx-auto pt-2 pb-16 px-4 flex flex-col items-center">
      <div className="flex w-full justify-end pb-4">
        <LanguageSwitch />
      </div>
      <div className="rounded-2xl w-full py-2 sm:p-8 md:p-12 sm:glass-card">
        <article className="prose prose-invert prose-headings:font-serif prose-headings:text-text-main prose-p:text-text-neutral prose-li:text-text-neutral prose-a:text-fuchsia-400 hover:prose-a:text-fuchsia-300 max-w-none">
          {children}
        </article>
      </div>

      <div className="pt-8">
        <Link
          href="/"
          className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium flex items-center gap-2"
        >
          <span>&larr;</span> {t("legal.backHome")}
        </Link>
      </div>
    </div>
  );
};
