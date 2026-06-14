import { PostCard } from "@/features/posts/components/PostCard";
import { ModerationPostResponseDto } from "@/features/posts/types/post.dto";
import { ReportDetails } from "@/features/shared/types/report.type";
import Button from "@/features/shared/components/ui/Button";
import ModerationReasonModal from "@/features/posts/components/ModerationReasonModal";
import { useState } from "react";
import { useI18n } from "@/i18n/useI18n";

type ModerationAction = "approve" | "reject" | "quarantine" | "reject-ban";

export default function ModerationQueueItem({
  post,
  onAction,
  isPending,
}: {
  post: ModerationPostResponseDto;
  onAction: (params: {
    postId: string;
    action: "approve" | "reject" | "quarantine";
    banAuthor?: boolean;
    justification?: string;
  }) => void;
  isPending: boolean;
}) {
  const { t } = useI18n();
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null);

  const handleReasonConfirm = (justification: string) => {
    if (!pendingAction || pendingAction === "approve") return;
    if (pendingAction === "reject-ban") {
      onAction({ postId: post.id, action: "reject", banAuthor: true, justification });
    } else {
      onAction({ postId: post.id, action: pendingAction, justification });
    }
    setPendingAction(null);
  };

  return (
    <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
      {pendingAction && pendingAction !== "approve" && (
        <ModerationReasonModal
          isOpen={true}
          action={pendingAction}
          isPending={isPending}
          onClose={() => setPendingAction(null)}
          onConfirm={handleReasonConfirm}
        />
      )}

      <div className="border-2 border-surface-card-background-default rounded-xl overflow-hidden relative ">
        <div className=" p-4 border-b ">
          <div className="flex flex-wrap gap-3 mb-3 font-mono text-xs">
            <span className="text-validation-warning-text font-bold bg-validation-warning-background/20 px-2 py-0.5 rounded">
              {t("common.status")}: {post.moderationStatus.toUpperCase()}
            </span>
            {post.flaggedReasons && post.flaggedReasons.length > 0 && (
              <span className="text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
                {t("common.flag")}: {post.flaggedReasons.join(", ")}
              </span>
            )}
            {post.moderationInfo?.source && (
              <span className="text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded">
                {t("common.source")}:{" "}
                {post.moderationInfo.source === "ai"
                  ? "AI"
                  : post.moderationInfo.source === "moderator"
                  ? "Moderator"
                  : post.moderationInfo.source === "user_report"
                  ? t("common.userReport")
                  : post.moderationInfo.source}
              </span>
            )}
          </div>

          {post.moderationInfo && (
            <div className="mt-2 text-xs text-foreground-secondary-default space-y-1">
              {post.moderationInfo.reasonSummary && (
                <p className="font-semibold">
                  {t("common.reason")}:{" "}
                  <span className="font-normal">
                    {post.moderationInfo.reasonSummary}
                  </span>
                </p>
              )}
              {post.moderationInfo.reasonDetails && (
                <p className="text-[11px] opacity-80 wrap-break-word">
                  {t("common.details")}:{" "}
                  <span className="italic">
                    {post.moderationInfo.reasonDetails}
                  </span>
                </p>
              )}
            </div>
          )}

          {post.reportsMeta && post.reportsMeta.length > 0 ? (
            <div className="mt-3 pt-3">
              <p className="text-[10px] uppercase tracking-widest text-foreground-secondary-default mb-2 font-bold opacity-70">
                {t("moderation.queue.userReports", { count: post.reportsMeta.length })}
              </p>
              <div className="flex flex-col gap-2">
                {post.reportsMeta.map((report: ReportDetails, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-sm bg-surface-card-background-default p-2 rounded border border-divider-subtle"
                  >
                    <div className="flex items-center gap-2 min-w-fit">
                      <span className="text-accent-fuchsia-background-default font-mono text-[10px] bg-accent-fuchsia-background-default/10 px-1.5 py-0.5 rounded border border-accent-fuchsia-border-default/20">
                        UID:{" "}
                        {report.uid ? report.uid.slice(0, 5) + "..." : "N/A"}
                      </span>
                      <span
                        className={`font-bold px-1.5 rounded text-[11px] uppercase ${
                          report.reason === "hate"
                            ? "text-validation-error-text bg-validation-error-background/30"
                            : report.reason === "spam"
                            ? "text-blue-400 bg-blue-900/30"
                            : "text-validation-warning-text bg-validation-warning-background/30"
                        }`}
                      >
                        {report.reason || t("common.report")}
                      </span>
                    </div>
                    <span className="text-foreground-secondary-default italic border-l-2 border-button-outline-border-default pl-2 text-xs break-all">
                      {report.details ? `"${report.details}"` : t("common.noDescription")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-foreground-secondary-default opacity-50 mt-1 italic">
              {t("moderation.queue.noReports")}
            </div>
          )}
        </div>

        <PostCard
          post={post}
          revealNSFW={true}
          moderationThumbnailImage
        />

        <div className="bg-surface-chrome-background-default p-3 flex flex-wrap justify-end gap-3 border-t border-divider-default shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          <Button
            text={t("moderation.queue.banAuthorDeletePost")}
            variant="danger"
            size="sm"
            onClick={() => setPendingAction("reject-ban")}
            disabled={isPending}
          />
          <Button
            text={t("moderation.deletePost")}
            variant="danger"
            className="border-validation-error-border/50 text-validation-error-text hover:bg-validation-error-background/10"
            size="sm"
            onClick={() => setPendingAction("reject")}
            disabled={isPending}
          />
          <Button
            text={t("moderation.quarantine")}
            variant="secondary"
            size="sm"
            onClick={() => setPendingAction("quarantine")}
            disabled={isPending}
          />
          <Button
            text={t("moderation.queue.approvePost")}
            variant="default"
            size="sm"
            onClick={() => onAction({ postId: post.id, action: "approve" })}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
