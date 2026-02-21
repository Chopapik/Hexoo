-- Comments table (from CommentEntity: ContentBase + post_id).
-- Each row is a comment under a post; approval uses moderation_status.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id text not null,
  text text not null default '',
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  moderation_status text not null default 'approved' check (moderation_status in ('approved', 'pending', 'rejected')),
  is_nsfw boolean not null default false,
  image_url text,
  image_meta jsonb,
  device text,
  flagged_reasons text[],
  flagged_source text[],
  reviewed_by text,
  reviewed_at timestamptz
);

-- List comments by post and by creation time.
create index if not exists comments_post_id_created_at on public.comments (post_id, created_at asc);
create index if not exists comments_moderation_status on public.comments (moderation_status);
