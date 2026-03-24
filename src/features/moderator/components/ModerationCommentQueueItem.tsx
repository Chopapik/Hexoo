"use client";

import { CommentItem } from "@/features/comments/components/CommentItem";
import type {
  ModerationCommentResponseDto,
  PublicCommentResponseDto,
} from "@/features/comments/types/comment.dto";
import ModerationReasonModal from "@/features/posts/components/ModerationReasonModal";
import { Avatar } from "@/features/posts/components/Avatar";
import Button from "@/features/shared/components/ui/Button";
import { ExpandableImageThumbnail } from "@/features/shared/components/media/ExpandableImageThumbnail";
import { ReportDetails } from "@/features/shared/types/report.type";
import { useState } from "react";

type ModerationAction = "approve" | "reject" | "quarantine" | "reject-ban";

function TreePostGutter() {
  return (
    <div
      className="relative flex h-full min-h-0 w-full shrink-0 flex-col items-center border-r border-fuchsia-500/15 bg-fuchsia-950/10"
      aria-hidden
    >
      <div className="flex w-full flex-1 flex-col items-center px-0 pt-4 pb-1">
        <div
          className="relative z-10 h-2 w-2 shrink-0 rounded-full border border-fuchsia-300/70 bg-fuchsia-600/80 shadow-[0_0_8px_rgba(217,70,249,0.35)] ring-1 ring-black/30"
        />
        <div className="mt-0.5 min-h-2 w-px flex-1 rounded-full bg-fuchsia-500/30" />
      </div>
    </div>
  );
}

function TreeCommentGutter() {
  return (
    <div
      className="relative flex h-full min-h-0 w-full shrink-0 flex-col items-center border-r border-fuchsia-500/25 bg-fuchsia-950/25"
      aria-hidden
    >
      <div className="flex w-full flex-1 flex-col items-center pb-4 pt-0">
        <div className="min-h-2 w-0.5 flex-1 rounded-full bg-fuchsia-500/50" />
        <div className="relative h-12 w-full shrink-0">
          <div className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 rounded-full bg-fuchsia-500/55" />
          <div className="absolute left-1/2 top-5 h-0.5 w-[16px] bg-fuchsia-500/55" />
          <div
            className="absolute left-[calc(50%+15px)] top-[19px] z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-fuchsia-100 bg-linear-to-br from-fuchsia-400 to-fuchsia-600 shadow-[0_0_14px_rgba(217,70,249,0.55)] ring-2 ring-black/40"
          />
        </div>
        <div className="min-h-4 w-0.5 flex-1 rounded-full bg-fuchsia-500/35" />
      </div>
    </div>
  );
}

export default function ModerationCommentQueueItem({
  comment,
  onAction,
  isPending,
}: {
  comment: ModerationCommentResponseDto;
  onAction: (params: {
    commentId: string;
    action: "approve" | "reject" | "quarantine";
    banAuthor?: boolean;
    justification?: string;
  }) => void;
  isPending: boolean;
}) {
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(
    null,
  );

  const handleReasonConfirm = (justification: string) => {
    if (!pendingAction || pendingAction === "approve") return;
    if (pendingAction === "reject-ban") {
      onAction({
        commentId: comment.id,
        action: "reject",
        banAuthor: true,
        justification,
      });
    } else {
      onAction({
        commentId: comment.id,
        action: pendingAction,
        justification,
      });
    }
    setPendingAction(null);
  };

  const forDisplay = comment as unknown as PublicCommentResponseDto;
  const parent = comment.parentPostPreview;

  return (
    <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
      {pendingAction && pendingAction !== "approve" && (
        <ModerationReasonModal
          isOpen={true}
          action={pendingAction}
          isPending={isPending}
          onClose={() => setPendingAction(null)}
          onConfirm={handleReasonConfirm}
          resource="comment"
        />
      )}

      <div className="border-2 border-primary-neutral-background-default rounded-xl overflow-hidden relative ">
        <p className="border-b border-fuchsia-500/10 bg-fuchsia-950/20 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-fuchsia-300/90 font-Albert_Sans">
          Wątek zgłoszenia · post (kontekst) → komentarz (zgłoszenie)
        </p>

        <div className="grid grid-cols-[28px_1fr] border-b border-white/10 bg-black/15">
          <TreePostGutter />
          <div className="min-w-0 px-2 py-2 sm:px-3">
            <p className="text-[9px] uppercase tracking-widest text-text-neutral/55 mb-1.5 font-semibold font-Albert_Sans">
              Post nadrzędny · kontekst
            </p>
            {parent ? (
              <div className="flex flex-col gap-2 min-w-0 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex min-w-0 flex-1 gap-2">
                  <div className="shrink-0 pt-px">
                    <Avatar
                      src={parent.userAvatarUrl ?? undefined}
                      alt={parent.userName}
                      className="size-6"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="min-w-0 flex-1 opacity-90">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-medium font-Albert_Sans text-text-main/90">
                        {parent.userName}
                      </span>
                      {parent.isNSFW && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-200/90 border border-amber-500/25">
                          NSFW
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-text-neutral/45">
                        {parent.id.slice(0, 8)}…
                      </span>
                    </div>
                    <p className="text-xs leading-snug text-text-neutral/75 font-Albert_Sans whitespace-pre-wrap line-clamp-2 wrap-break-word">
                      {parent.text?.trim()
                        ? parent.text
                        : "(post bez treści tekstowej)"}
                    </p>
                  </div>
                </div>
                {parent.imageUrl ? (
                  <div className="shrink-0">
                    <ExpandableImageThumbnail
                      src={parent.imageUrl}
                      alt="Obraz z posta nadrzędnego"
                      variant="compact"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-[11px] text-text-neutral/70 italic">
                Nie znaleziono posta nadrzędnego w bazie.{" "}
                <span className="font-mono not-italic opacity-80">
                  post_id: {comment.postId.slice(0, 8)}…
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[36px_1fr]">
          <TreeCommentGutter />
          <div className="flex-1 min-w-0 flex flex-col border-l border-fuchsia-500/20 bg-black/30">
            <div className=" p-5 border-b border-white/10 ">
              <p className="text-xs uppercase tracking-widest text-fuchsia-300/95 mb-3 font-bold font-Albert_Sans">
                Zgłoszony komentarz
              </p>
              <div className="flex flex-wrap gap-3 mb-3 font-mono text-sm">
                <span className="text-yellow-200 font-bold bg-yellow-500/20 px-2 py-0.5 rounded">
                  STATUS: {comment.moderationStatus.toUpperCase()}
                </span>
                {!parent && (
                  <span className="text-slate-300 bg-slate-500/20 px-2 py-0.5 rounded">
                    POST ID: {comment.postId.slice(0, 8)}…
                  </span>
                )}
                {comment.flaggedReasons && comment.flaggedReasons.length > 0 && (
                  <span className="text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
                    FLAGA: {comment.flaggedReasons.join(", ")}
                  </span>
                )}
                {comment.moderationInfo?.source && (
                  <span className="text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded">
                    ŹRÓDŁO:{" "}
                    {comment.moderationInfo.source === "ai"
                      ? "AI"
                      : comment.moderationInfo.source === "moderator"
                        ? "Moderator"
                        : comment.moderationInfo.source === "user_report"
                          ? "Zgłoszenie użytkownika"
                          : comment.moderationInfo.source}
                  </span>
                )}
              </div>

              {comment.moderationInfo && (
                <div className="mt-2 text-xs text-text-neutral space-y-1">
                  {comment.moderationInfo.reasonSummary && (
                    <p className="font-semibold">
                      Powód:{" "}
                      <span className="font-normal">
                        {comment.moderationInfo.reasonSummary}
                      </span>
                    </p>
                  )}
                  {comment.moderationInfo.reasonDetails && (
                    <p className="text-[11px] opacity-80 wrap-break-word">
                      Szczegóły:{" "}
                      <span className="italic">
                        {comment.moderationInfo.reasonDetails}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {comment.reportsMeta && comment.reportsMeta.length > 0 ? (
                <div className="mt-3 pt-3">
                  <p className="text-[10px] uppercase tracking-widest text-text-neutral mb-2 font-bold opacity-70">
                    Zgłoszenia użytkowników ({comment.reportsMeta.length}):
                  </p>
                  <div className="flex flex-col gap-2">
                    {comment.reportsMeta.map(
                      (report: ReportDetails, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-sm bg-black/40 p-2 rounded border border-white/5"
                        >
                          <div className="flex items-center gap-2 min-w-fit">
                            <span className="text-fuchsia-400 font-mono text-[10px] bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                              UID:{" "}
                              {report.uid
                                ? report.uid.slice(0, 5) + "..."
                                : "N/A"}
                            </span>
                            <span
                              className={`font-bold px-1.5 rounded text-[11px] uppercase ${
                                report.reason === "hate"
                                  ? "text-red-400 bg-red-900/30"
                                  : report.reason === "spam"
                                    ? "text-blue-400 bg-blue-900/30"
                                    : "text-yellow-400 bg-yellow-900/30"
                              }`}
                            >
                              {report.reason || "zgłoszenie"}
                            </span>
                          </div>
                          <span className="text-gray-300 italic border-l-2 border-white/20 pl-2 text-xs break-all">
                            {report.details
                              ? `"${report.details}"`
                              : "(brak opisu)"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-text-neutral opacity-50 mt-1 italic">
                  Brak szczegółowych zgłoszeń od użytkowników.
                </div>
              )}
            </div>

            <div className="px-5 pt-3 pb-2">
              <CommentItem
                comment={forDisplay}
                moderationCompactImage
                moderationProminent
              />
            </div>

            <div className="bg-secondary-neutral-background-default p-3 flex flex-wrap justify-end gap-3 border-t border-white/10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
              <Button
                text="Banuj autora i usuń"
                variant="danger"
                size="sm"
                onClick={() => setPendingAction("reject-ban")}
                disabled={isPending}
              />
              <Button
                text="Usuń komentarz"
                variant="danger"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                size="sm"
                onClick={() => setPendingAction("reject")}
                disabled={isPending}
              />
              <Button
                text="Kwarantanna"
                variant="secondary"
                size="sm"
                onClick={() => setPendingAction("quarantine")}
                disabled={isPending}
              />
              <Button
                text="Zatwierdź komentarz"
                variant="default"
                size="sm"
                onClick={() =>
                  onAction({ commentId: comment.id, action: "approve" })
                }
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
