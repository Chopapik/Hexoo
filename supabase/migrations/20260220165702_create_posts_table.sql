-- Posts table (from PostRow / ContentBase).
-- Main feed content with moderation and report metadata.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
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
  user_reports text[],
  reports_meta jsonb,
  reviewed_by text,
  reviewed_at timestamptz
);

-- Indexes for feed listing and filtering by user or status.
create index if not exists posts_created_at_desc on public.posts (created_at desc);
create index if not exists posts_user_id_created_at on public.posts (user_id, created_at desc);
create index if not exists posts_moderation_status on public.posts (moderation_status);
