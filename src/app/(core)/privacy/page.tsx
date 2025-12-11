"use client";

import PrivacyContent from "@/content/privacy.mdx";
import { LegalPageWrapper } from "@/features/shared/components/layout/LegalPageWrapper";

export default function PrivacyPage() {
  return (
    <LegalPageWrapper>
      <PrivacyContent />
    </LegalPageWrapper>
  );
}
