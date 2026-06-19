alter table public.users
add column if not exists session_invalidated_at timestamptz null;
