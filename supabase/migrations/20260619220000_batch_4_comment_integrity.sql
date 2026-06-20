-- Batch 4: make comments_count an exact count of publicly visible comments.
-- A deferred reconciliation keeps all existing comment write paths compatible,
-- including moderation/report transitions, while committing row and counter
-- changes atomically in the same transaction.
create or replace function public.reconcile_visible_comment_count()
returns trigger
language plpgsql
as $$
declare
  v_post_id uuid;
begin
  if tg_op = 'UPDATE'
    and old.post_id is not distinct from new.post_id
    and old.is_pending is not distinct from new.is_pending then
    return null;
  end if;

  if tg_op = 'UPDATE' and old.post_id is distinct from new.post_id then
    perform id from public.posts where id = old.post_id for update;
    update public.posts
    set comments_count = (
      select count(*)::int
      from public.comments
      where post_id = old.post_id
        and is_pending = false
    ), updated_at = now()
    where id = old.post_id;
  end if;

  v_post_id := case when tg_op = 'DELETE' then old.post_id else new.post_id end;

  perform id from public.posts where id = v_post_id for update;
  update public.posts
  set comments_count = (
    select count(*)::int
    from public.comments
    where post_id = v_post_id
      and is_pending = false
  ), updated_at = now()
  where id = v_post_id;

  return null;
end;
$$;

drop trigger if exists sync_visible_comment_count on public.comments;
create constraint trigger sync_visible_comment_count
after insert or update or delete on public.comments
deferrable initially deferred
for each row execute function public.reconcile_visible_comment_count();

-- Keep the compatible signature, but never trust a caller-supplied parent.
create or replace function public.delete_comment_tx(
  p_comment_id uuid,
  p_post_id uuid
) returns void
language plpgsql
as $$
declare
  v_post_id uuid;
begin
  if p_comment_id is null then
    raise exception 'comment_id is required';
  end if;

  select post_id
  into v_post_id
  from public.comments
  where id = p_comment_id
  for update;

  if not found then
    raise exception 'Comment % not found', p_comment_id;
  end if;

  if p_post_id is distinct from v_post_id then
    raise exception 'Comment % does not belong to post %', p_comment_id, p_post_id;
  end if;

  delete from public.comments where id = p_comment_id;
end;
$$;

alter table public.posts
  drop constraint if exists posts_text_max_length,
  add constraint posts_text_max_length check (char_length(text) <= 2048);

alter table public.comments
  drop constraint if exists comments_text_max_length,
  add constraint comments_text_max_length check (char_length(text) <= 500);
