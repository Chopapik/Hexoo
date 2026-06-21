import type { ContentStatus } from "@/features/shared/types/content.type";

export type ModerationResourceType = "post" | "comment";

export const MODERATION_REASON_SUMMARY_MAX_CHARS = 500;
export const MODERATION_REASON_DETAILS_MAX_CHARS = 4000;

export type ModerationEvidenceSource = "text" | "image";

export type ModerationEvidence = {
  category: string;
  score: number;
  sources: ModerationEvidenceSource[];
};

export type CanonicalContentStatus = ContentStatus;

export function deriveCanonicalContentStatus(input: {
  isPending: boolean;
  decision?: "approved" | "pending" | "rejected" | "quarantined";
  reasonSummary?: string;
}): CanonicalContentStatus {
  if (input.decision === "rejected") return "rejected";
  if (
    input.decision === "quarantined" ||
    input.reasonSummary?.toLowerCase().includes("quarantin")
  ) {
    return "quarantined";
  }
  if (input.isPending || input.decision === "pending") return "pending";
  return "visible";
}

export function isPubliclyVisibleStatus(
  status: CanonicalContentStatus,
): boolean {
  return status === "visible";
}
