-- Validate canonical content status nullability after the Batch 3/4 backfill.
-- The first Batch 3/4 migration adds posts.status/comments.status as
-- NOT NULL DEFAULT 'visible' before it backfills pending rows. This migration
-- intentionally performs no UPDATE and no ALTER TABLE on posts/comments, so it
-- is safe to run immediately after the backfill on remote databases with
-- existing rows and deferred trigger events.

do $$
declare
  v_posts_nullable text;
  v_comments_nullable text;
begin
  if exists (select 1 from public.posts where status is null) then
    raise exception 'posts.status contains null values';
  end if;

  if exists (select 1 from public.comments where status is null) then
    raise exception 'comments.status contains null values';
  end if;

  select is_nullable
  into v_posts_nullable
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'posts'
    and column_name = 'status';

  select is_nullable
  into v_comments_nullable
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'comments'
    and column_name = 'status';

  if v_posts_nullable is distinct from 'NO' then
    raise exception 'posts.status is expected to be NOT NULL';
  end if;

  if v_comments_nullable is distinct from 'NO' then
    raise exception 'comments.status is expected to be NOT NULL';
  end if;
end $$;
