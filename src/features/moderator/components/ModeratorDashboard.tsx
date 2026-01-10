"use client";

import Button from "@/features/shared/components/ui/Button";
import { useModeratorDashboard } from "../hooks/useModeratorDashboard";
import { Post } from "@/features/posts/types/post.type";
import ModerationQueueItem from "./ModerationQueueItem";

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
    <div className="w-full max-w-4xl mx-auto pt-6 flex flex-col gap-6 pb-20">
      <div className="glass-card p-6 rounded-xl border border-primary-fuchsia-stroke-default bg-black/40 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-text-main font-Albert_Sans">
          Panel Moderatora
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
        <div className="text-center text-text-neutral py-20 bg-white/5 rounded-xl border border-dashed border-secondary-neutral-background-default">
          <p className="text-sm mt-2 opacity-60">
            Brak postów wymagających uwagi.
          </p>
        </div>
      )}

      {posts?.map((post: Post) => (
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
