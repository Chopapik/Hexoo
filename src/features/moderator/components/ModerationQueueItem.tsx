import { PostCard } from "@/features/posts/components/PostCard";
import { ModerationPostDto } from "@/features/posts/types/post.dto";
import { ReportDetails } from "@/features/shared/types/report.type";
import Button from "@/features/shared/components/ui/Button";
import ModerationReasonModal from "@/features/posts/components/ModerationReasonModal";
import { useState } from "react";

type ModerationAction = "approve" | "reject" | "quarantine" | "reject-ban";

export default function ModerationQueueItem({
  post,
  onAction,
  isPending,
}: {
  post: ModerationPostDto;
  onAction: (params: {
    postId: string;
    action: "approve" | "reject" | "quarantine";
    banAuthor?: boolean;
    justification?: string;
  }) => void;
  isPending: boolean;
}) {
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

      <div className="border-2 border-primary-neutral-background-default rounded-xl overflow-hidden relative ">
        <div className=" p-4 border-b ">
          <div className="flex flex-wrap gap-3 mb-3 font-mono text-xs">
            <span className="text-yellow-200 font-bold bg-yellow-500/20 px-2 py-0.5 rounded">
              STATUS: {post.moderationStatus.toUpperCase()}
            </span>
            {post.flaggedReasons && post.flaggedReasons.length > 0 && (
              <span className="text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
                FLAGA: {post.flaggedReasons.join(", ")}
              </span>
            )}
            {post.moderationInfo?.source && (
              <span className="text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded">
                ŹRÓDŁO:{" "}
                {post.moderationInfo.source === "ai"
                  ? "AI"
                  : post.moderationInfo.source === "moderator"
                  ? "Moderator"
                  : post.moderationInfo.source === "user_report"
                  ? "Zgłoszenie użytkownika"
                  : post.moderationInfo.source}
              </span>
            )}
          </div>

          {post.moderationInfo && (
            <div className="mt-2 text-xs text-text-neutral space-y-1">
              {post.moderationInfo.reasonSummary && (
                <p className="font-semibold">
                  Powód:{" "}
                  <span className="font-normal">
                    {post.moderationInfo.reasonSummary}
                  </span>
                </p>
              )}
              {post.moderationInfo.reasonDetails && (
                <p className="text-[11px] opacity-80 wrap-break-word">
                  Szczegóły:{" "}
                  <span className="italic">
                    {post.moderationInfo.reasonDetails}
                  </span>
                </p>
              )}
            </div>
          )}

          {post.reportsMeta && post.reportsMeta.length > 0 ? (
            <div className="mt-3 pt-3">
              <p className="text-[10px] uppercase tracking-widest text-text-neutral mb-2 font-bold opacity-70">
                Zgłoszenia użytkowników ({post.reportsMeta.length}):
              </p>
              <div className="flex flex-col gap-2">
                {post.reportsMeta.map((report: ReportDetails, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-sm bg-black/40 p-2 rounded border border-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-fit">
                      <span className="text-fuchsia-400 font-mono text-[10px] bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                        UID:{" "}
                        {report.uid ? report.uid.slice(0, 5) + "..." : "N/A"}
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
                      {report.details ? `"${report.details}"` : "(brak opisu)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-neutral opacity-50 mt-1 italic">
              Brak szczegółowych zgłoszeń od użytkowników.
            </div>
          )}
        </div>

        <PostCard post={post} />

        <div className="bg-secondary-neutral-background-default p-3 flex flex-wrap justify-end gap-3 border-t border-white/10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          <Button
            text="Banuj Autora & Usuń"
            variant="danger"
            size="sm"
            onClick={() => setPendingAction("reject-ban")}
            disabled={isPending}
          />
          <Button
            text="Usuń Post"
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
            text="Zatwierdź post"
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
