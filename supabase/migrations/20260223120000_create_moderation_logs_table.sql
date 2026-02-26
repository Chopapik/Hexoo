create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  timestamp timestamptz not null default now(),
  verdict text not null,
  categories text[] not null default '{}',
  action_taken text not null check (action_taken in ('BLOCKED_CREATION', 'FLAGGED_FOR_REVIEW', 'CONTENT_REMOVED')),
  resource_type text,
  resource_id uuid,
  source text,
  actor_id text,
  reason_summary text,
  reason_details text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_logs_resource_idx
  on public.moderation_logs (resource_type, resource_id, created_at desc);

