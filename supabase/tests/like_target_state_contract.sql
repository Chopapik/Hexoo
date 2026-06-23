begin;

do $$
declare
  v_shared_id uuid := gen_random_uuid();
  v_holder_id uuid := gen_random_uuid();
  v_result jsonb;
  v_count int;
begin
  insert into public.posts (id, user_id, text)
  values
    (v_shared_id, 'batch-5-owner', 'collision post'),
    (v_holder_id, 'batch-5-owner', 'comment holder');
  insert into public.comments (id, post_id, user_id, text)
  values (v_shared_id, v_holder_id, 'batch-5-owner', 'collision comment');

  select public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'posts', true
  ) into v_result;
  if v_result <> jsonb_build_object('liked', true, 'likesCount', 1) then
    raise exception 'first like returned unexpected result: %', v_result;
  end if;

  select public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'posts', true
  ) into v_result;
  select likes_count into v_count from public.posts where id = v_shared_id;
  if v_count <> 1 or (
    select count(*) from public.likes
    where user_id = 'batch-5-user'
      and parent_id = v_shared_id::text
      and parent_collection = 'posts'
  ) <> 1 then
    raise exception 'repeated like was not idempotent';
  end if;

  perform public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'posts', false
  );
  select public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'posts', false
  ) into v_result;
  select likes_count into v_count from public.posts where id = v_shared_id;
  if v_count <> 0 or v_result <> jsonb_build_object('liked', false, 'likesCount', 0) then
    raise exception 'repeated unlike was not idempotent: count %, result %', v_count, v_result;
  end if;

  perform public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'posts', true
  );
  perform public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'comments', true
  );
  select count(*) into v_count
  from public.likes
  where user_id = 'batch-5-user' and parent_id = v_shared_id::text;
  if v_count <> 2 then
    raise exception 'post/comment collision expected two independent likes, got %', v_count;
  end if;
  if (select likes_count from public.posts where id = v_shared_id) <> 1
    or (select likes_count from public.comments where id = v_shared_id) <> 1 then
    raise exception 'post/comment collision counters are not isolated';
  end if;

  perform public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'comments', false
  );
  perform public.set_like_state_tx(
    'batch-5-user', v_shared_id::text, 'comments', false
  );
  if (select likes_count from public.comments where id = v_shared_id) <> 0 then
    raise exception 'comment likes_count went below or stayed above zero';
  end if;
  if (select likes_count from public.posts where id = v_shared_id) <> 1 then
    raise exception 'comment unlike changed the post counter';
  end if;

  begin
    perform public.set_like_state_tx(
      'batch-5-user', gen_random_uuid()::text, 'posts', true
    );
    raise exception 'missing-parent like unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'missing-parent like unexpectedly succeeded' then
        raise;
      end if;
  end;

  raise notice 'Batch 5 local DB contract checks passed';
end;
$$;

rollback;
