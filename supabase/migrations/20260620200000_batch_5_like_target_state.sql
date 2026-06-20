alter table public.likes
  drop constraint if exists likes_parent_id_user_id_key,
  drop constraint if exists likes_parent_collection_parent_id_user_id_key;

alter table public.likes
  add constraint likes_parent_collection_parent_id_user_id_key
  unique (parent_collection, parent_id, user_id);

drop index if exists public.likes_user_id_parent_id;
drop index if exists public.likes_user_collection_parent_id;
create index likes_user_collection_parent_id
  on public.likes (user_id, parent_collection, parent_id);

create or replace function public.set_like_state_tx(
  p_user_id text,
  p_parent_id text,
  p_parent_collection text,
  p_liked boolean
) returns jsonb
language plpgsql
as $$
declare
  v_like_id text;
  v_changed int := 0;
  v_stored_count int;
  v_likes_count int;
begin
  if p_user_id is null or btrim(p_user_id) = '' then
    raise exception 'user_id is required';
  end if;
  if p_parent_id is null or btrim(p_parent_id) = '' then
    raise exception 'parent_id is required';
  end if;
  if p_parent_collection not in ('posts', 'comments') then
    raise exception 'Unsupported parent_collection: %', p_parent_collection;
  end if;
  if p_liked is null then
    raise exception 'liked target state is required';
  end if;

  if p_parent_collection = 'posts' then
    select likes_count into v_stored_count
    from public.posts
    where id = p_parent_id::uuid
    for update;
  else
    select likes_count into v_stored_count
    from public.comments
    where id = p_parent_id::uuid
    for update;
  end if;
  if not found then
    raise exception 'Parent % (%) not found', p_parent_id, p_parent_collection;
  end if;

  v_like_id := p_parent_collection || '_' || p_parent_id || '_' || p_user_id;

  if p_liked then
    insert into public.likes (id, parent_id, parent_collection, user_id, liked_at)
    values (v_like_id, p_parent_id, p_parent_collection, p_user_id, now())
    on conflict (parent_collection, parent_id, user_id) do nothing;
    get diagnostics v_changed = row_count;
  else
    delete from public.likes
    where parent_id = p_parent_id
      and parent_collection = p_parent_collection
      and user_id = p_user_id;
    get diagnostics v_changed = row_count;
  end if;

  select greatest(0, count(*)::int) into v_likes_count
  from public.likes
  where parent_id = p_parent_id
    and parent_collection = p_parent_collection;

  if v_changed > 0 or v_stored_count is distinct from v_likes_count then
    if p_parent_collection = 'posts' then
      update public.posts
      set likes_count = v_likes_count, updated_at = now()
      where id = p_parent_id::uuid;
    else
      update public.comments
      set likes_count = v_likes_count, updated_at = now()
      where id = p_parent_id::uuid;
    end if;
  end if;

  return jsonb_build_object(
    'liked', p_liked,
    'likesCount', v_likes_count
  );
end;
$$;

drop function if exists public.toggle_like_tx(text, text, text);
