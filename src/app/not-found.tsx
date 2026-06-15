"use client";

import Link from "next/link";
import Button from "@/features/shared/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <div className="glass-card max-w-md p-10 border border-surface-card-border-default rounded-2xl flex h-fit flex-col items-center shadow-2xl">
        <h1 className="text-4xl font-serif font-bold text-foreground-primary-default text-center mb-4">
          {t("error.404.title")}
        </h1>

        <h2 className="text-xl font-sans font-medium text-foreground-secondary-default text-center mb-6">
          {t("error.404.copy")}
        </h2>

        <Link href="/">
          <Button text={t("common.backHome")} variant="default" size="md" />
        </Link>
      </div>
    </div>
  );
}
