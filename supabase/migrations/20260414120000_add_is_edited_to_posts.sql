alter table public.posts
  add column if not exists is_edited boolean not null default false;
