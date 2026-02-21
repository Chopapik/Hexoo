create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id text not null,
  reason text not null,
  details text,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_reports_post_id on public.post_reports (post_id);
create index if not exists post_reports_created_at on public.post_reports (created_at desc);


create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id text not null,
  reason text not null,
  details text,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id)
);

create index if not exists comment_reports_comment_id on public.comment_reports (comment_id);
create index if not exists comment_reports_created_at on public.comment_reports (created_at desc);
