"use client";

import PrivacyContent from "@/content/privacy.mdx";
import PrivacyContentEn from "@/content/privacy.en.mdx";
import { LegalPageWrapper } from "@/features/shared/components/layout/LegalPageWrapper";
import { useI18n } from "@/i18n/useI18n";

export default function PrivacyPage() {
  const { lang } = useI18n();
  const Content = lang === "en" ? PrivacyContentEn : PrivacyContent;

  return (
    <LegalPageWrapper>
      <Content />
    </LegalPageWrapper>
  );
}
