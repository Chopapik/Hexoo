"use client";

import TermsContent from "@/content/terms.mdx";
import { LegalPageWrapper } from "@/features/shared/components/layout/LegalPageWrapper";

export default function TermsPage() {
  return (
    <LegalPageWrapper>
      <TermsContent />
    </LegalPageWrapper>
  );
}
