"use client";

import TermsContent from "@/content/terms.mdx";
import TermsContentEn from "@/content/terms.en.mdx";
import { LegalPageWrapper } from "@/features/shared/components/layout/LegalPageWrapper";
import { useI18n } from "@/i18n/useI18n";

export default function TermsPage() {
  const { lang } = useI18n();
  const Content = lang === "en" ? TermsContentEn : TermsContent;

  return (
    <LegalPageWrapper>
      <Content />
    </LegalPageWrapper>
  );
}
