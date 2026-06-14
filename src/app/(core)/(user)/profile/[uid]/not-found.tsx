"use client";

import Link from "next/link";
import Button from "@/features/shared/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

export default function ProfileNotFound() {
  const { t } = useI18n();

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 flex flex-col items-center    animate-in fade-in zoom-in duration-300">
        <h1 className="text-3xl font-serif font-bold text-foreground-primary-default text-center mb-3">
          {t("profile.notFoundTitle")}
        </h1>

        <h2 className="text-lg font-sans font-medium text-center mb-6">
          {t("profile.notFoundCopy")}
        </h2>

        <Link href="/">
          <Button
            text={t("common.backHome")}
            variant="default"
            size="md"
            className="w-full sm:w-auto"
          />
        </Link>
      </div>
    </div>
  );
}
