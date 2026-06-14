"use client";

import { useI18n } from "@/i18n/useI18n";
import { LANGUAGES, type Lang } from "@/i18n/translations";

type LanguageSwitchProps = {
  compact?: boolean;
  className?: string;
};

export default function LanguageSwitch({
  compact = false,
  className = "",
}: LanguageSwitchProps) {
  const { lang, setLanguage, t } = useI18n();

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-surface-card-border-default bg-surface-chrome-background-default/60 p-0.5 font-sans ${className}`}
      aria-label={t("common.language")}
    >
      {LANGUAGES.map((language: Lang) => {
        const isActive = lang === language;
        return (
          <button
            key={language}
            type="button"
            onClick={() => setLanguage(language)}
            className={[
              "rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors",
              compact ? "min-w-8" : "min-w-10",
              isActive
                ? "bg-accent-fuchsia-border-default text-foreground-primary-default"
                : "text-foreground-secondary-default hover:text-foreground-primary-default",
            ].join(" ")}
            aria-pressed={isActive}
            title={t(language === "pl" ? "lang.pl" : "lang.en")}
          >
            {language}
          </button>
        );
      })}
    </div>
  );
}
