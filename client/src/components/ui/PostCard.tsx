import React from "react";

export type Post = {
  id: string | number;
  user: string;
  date: string;
  device: string;
  body: string;
};

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <article className="w-full rounded-xl border-t border-primary-neutral-stroke-default bg-primary-neutral-background-default p-4">
      <header className="flex items-start gap-3">
        <div className="shrink-0 size-10 rounded-full bg-text-neutral/20 inline-flex items-center justify-center">
          <span className="text-text-neutral text-xl">@</span>
        </div>
        <div className="flex flex-col">
          <div className="text-text-neutral font-semibold">{post.user}</div>
          <div className="text-text-neutral/60 text-xs">
            {post.date} • Upload from {post.device}
          </div>
        </div>
      </header>
      <p className="mt-4 text-text-neutral leading-relaxed">
        {post.body}
      </p>
    </article>
  );
};

