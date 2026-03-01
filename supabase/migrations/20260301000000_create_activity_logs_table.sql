create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  action text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_user_created_idx
  on public.activity_logs (user_id, created_at desc);
