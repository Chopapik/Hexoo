-- Comments table (from CommentEntity: ContentBase + post_id).
-- Each row is a comment under a post with minimal moderation status fields.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id text not null,
  text text not null default '',
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  is_nsfw boolean not null default false,
  is_pending boolean not null default false,
  image_url text,
  image_meta jsonb,
  device text
);

-- List comments by post and by creation time.
create index if not exists comments_post_id_created_at on public.comments (post_id, created_at asc);
create index if not exists comments_is_pending on public.comments (is_pending);
