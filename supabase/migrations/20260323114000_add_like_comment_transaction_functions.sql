create or replace function public.toggle_like_tx(
  p_user_id text,
  p_parent_id text,
  p_parent_collection text
) returns boolean
language plpgsql
as $$
declare
  v_like_id text;
  v_inserted int;
  v_deleted int;
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

  v_like_id := p_parent_id || '_' || p_user_id;

  insert into public.likes (id, parent_id, parent_collection, user_id, liked_at)
  values (v_like_id, p_parent_id, p_parent_collection, p_user_id, now())
  on conflict do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    if p_parent_collection = 'posts' then
      update public.posts
      set
        likes_count = likes_count + 1,
        updated_at = now()
      where id = p_parent_id::uuid;
    else
      update public.comments
      set
        likes_count = likes_count + 1,
        updated_at = now()
      where id = p_parent_id::uuid;
    end if;

    if not found then
      raise exception 'Parent % (%) not found', p_parent_id, p_parent_collection;
    end if;

    return true;
  end if;

  delete from public.likes
  where parent_id = p_parent_id
    and parent_collection = p_parent_collection
    and user_id = p_user_id;

  get diagnostics v_deleted = row_count;

  if v_deleted > 0 then
    if p_parent_collection = 'posts' then
      update public.posts
      set
        likes_count = greatest(0, likes_count - 1),
        updated_at = now()
      where id = p_parent_id::uuid;
    else
      update public.comments
      set
        likes_count = greatest(0, likes_count - 1),
        updated_at = now()
      where id = p_parent_id::uuid;
    end if;

    if not found then
      raise exception 'Parent % (%) not found', p_parent_id, p_parent_collection;
    end if;

    return false;
  end if;

  return false;
end;
$$;

create or replace function public.create_comment_tx(
  p_post_id uuid,
  p_user_id text,
  p_text text,
  p_likes_count int,
  p_comments_count int,
  p_created_at timestamptz,
  p_updated_at timestamptz,
  p_is_nsfw boolean,
  p_is_pending boolean,
  p_image_url text,
  p_image_meta jsonb,
  p_device text
) returns uuid
language plpgsql
as $$
declare
  v_comment_id uuid;
begin
  if p_post_id is null then
    raise exception 'post_id is required';
  end if;

  if p_user_id is null or btrim(p_user_id) = '' then
    raise exception 'user_id is required';
  end if;

  insert into public.comments (
    post_id,
    user_id,
    text,
    likes_count,
    comments_count,
    created_at,
    updated_at,
    is_nsfw,
    is_pending,
    image_url,
    image_meta,
    device
  )
  values (
    p_post_id,
    p_user_id,
    coalesce(p_text, ''),
    coalesce(p_likes_count, 0),
    coalesce(p_comments_count, 0),
    coalesce(p_created_at, now()),
    p_updated_at,
    coalesce(p_is_nsfw, false),
    coalesce(p_is_pending, false),
    p_image_url,
    p_image_meta,
    p_device
  )
  returning id into v_comment_id;

  update public.posts
  set
    comments_count = comments_count + 1,
    updated_at = now()
  where id = p_post_id;

  if not found then
    raise exception 'Post % not found', p_post_id;
  end if;

  return v_comment_id;
end;
$$;

create or replace function public.delete_comment_tx(
  p_comment_id uuid,
  p_post_id uuid
) returns void
language plpgsql
as $$
begin
  if p_comment_id is null then
    raise exception 'comment_id is required';
  end if;

  delete from public.comments where id = p_comment_id;

  if not found then
    raise exception 'Comment % not found', p_comment_id;
  end if;

  update public.posts
  set
    comments_count = greatest(comments_count - 1, 0),
    updated_at = now()
  where id = p_post_id;
end;
$$;
