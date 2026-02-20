-- Likes table (from LikeEntity).
-- One row per user–parent like; parent is either a post or a comment (parent_collection).
create table if not exists public.likes (
  id text primary key,
  parent_id text not null,
  parent_collection text not null check (parent_collection in ('posts', 'comments')),
  user_id text not null,
  liked_at timestamptz not null default now(),
  unique (parent_id, user_id)
);

-- Find which parents a user has liked (e.g. for "isLikedByMe").
create index if not exists likes_user_id_parent_id on public.likes (user_id, parent_id);
