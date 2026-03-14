-- Posts table (from PostRow / ContentBase).
-- Main feed content with minimal moderation status fields.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
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

-- Indexes for feed listing and filtering by user and pending state.
create index if not exists posts_created_at_desc on public.posts (created_at desc);
create index if not exists posts_user_id_created_at on public.posts (user_id, created_at desc);
create index if not exists posts_is_pending on public.posts (is_pending);
