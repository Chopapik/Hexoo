"use client";

import { PostCard } from "@/features/posts/components/PostLayout";
import Button from "@/features/shared/components/ui/Button";
import { useModeratorDashboard } from "../hooks/useModeratorDashboard";

const ModerationQueueItem = ({ post, onAction, isPending }: any) => {
  return (
    <div className="relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border-2 border-primary-neutral-background-default rounded-xl overflow-hidden relative ">
        <div className=" p-4 border-b ">
          <div className="flex flex-wrap gap-3 mb-3 font-mono text-xs">
            <span className="text-yellow-200 font-bold bg-yellow-500/20 px-2 py-0.5 rounded">
              STATUS: {post.moderationStatus.toUpperCase()}
            </span>
            {post.flaggedReasons?.length > 0 && (
              <span className="text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded">
                FLAGA: {post.flaggedReasons.join(", ")}
              </span>
            )}
          </div>

          {post.reportsMeta && post.reportsMeta.length > 0 ? (
            <div className="mt-3 pt-3">
              <p className="text-[10px] uppercase tracking-widest text-text-neutral mb-2 font-bold opacity-70">
                Zgłoszenia użytkowników ({post.reportsMeta.length}):
              </p>
              <div className="flex flex-col gap-2">
                {post.reportsMeta.map((report: any, idx: number) => (
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

        <div className="bg-[#151515] p-3 flex flex-wrap justify-end gap-3 border-t border-white/10 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          <Button
            text="Banuj Autora & Usuń"
            variant="danger"
            size="sm"
            onClick={() =>
              onAction({ postId: post.id, action: "reject", banAuthor: true })
            }
            disabled={isPending}
          />
          <Button
            text="Usuń Post"
            variant="danger"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            size="sm"
            onClick={() => onAction({ postId: post.id, action: "reject" })}
            disabled={isPending}
          />
          <Button
            text="Zatwierdź (Fałszywy alarm)"
            variant="gradient-fuchsia"
            size="sm"
            onClick={() => onAction({ postId: post.id, action: "approve" })}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
};

export default function ModeratorDashboard() {
  const { posts, isLoading, performAction, isActionPending } =
    useModeratorDashboard();

  if (isLoading)
    return (
      <div className="text-white p-10 text-center animate-pulse">
        Ładowanie zgłoszeń...
      </div>
    );

  return (
    <div className="w-full max-w-[920px] mx-auto pt-6 flex flex-col gap-6 pb-20">
      <div className="glass-card p-6 rounded-xl border border-primary-fuchsia-stroke-default bg-black/40 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-text-main font-Albert_Sans">
          Panel Moderatora 🛡️
        </h1>
        <p className="text-text-neutral text-sm mt-1">
          Kolejka postów oflagowanych przez AI oraz zgłoszonych przez
          użytkowników.
          <br />
          Liczba oczekujących:{" "}
          <span className="text-fuchsia-400 font-bold">
            {posts?.length || 0}
          </span>
        </p>
      </div>

      {posts?.length === 0 && (
        <div className="text-center text-text-neutral py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
          <p className="text-xl">Czysto! ✨</p>
          <p className="text-sm mt-2 opacity-60">
            Brak postów wymagających uwagi.
          </p>
        </div>
      )}

      {posts?.map((post: any) => (
        <ModerationQueueItem
          key={post.id}
          post={post}
          onAction={performAction}
          isPending={isActionPending}
        />
      ))}
    </div>
  );
}
