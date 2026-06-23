begin;

do $$
declare
  v_post_a uuid;
  v_post_b uuid;
  v_visible uuid;
  v_pending uuid;
  v_count int;
begin
  insert into public.posts (user_id, text)
  values ('batch-4-owner', 'post A') returning id into v_post_a;
  insert into public.posts (user_id, text)
  values ('batch-4-owner', 'post B') returning id into v_post_b;

  select public.create_comment_tx(
    v_post_a, 'batch-4-owner', 'visible', 0, 0, now(), now(),
    false, false, null, null, 'test'
  ) into v_visible;
  select public.create_comment_tx(
    v_post_a, 'batch-4-owner', 'pending', 0, 0, now(), now(),
    false, true, null, null, 'test'
  ) into v_pending;

  set constraints sync_visible_comment_count immediate;

  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 1 then
    raise exception 'visible + pending create expected count 1, got %', v_count;
  end if;

  set constraints sync_visible_comment_count deferred;
  perform public.moderator_review_comment_tx(
    v_pending, 'approve', 'batch-4-moderator', '{}', '', false
  );
  set constraints sync_visible_comment_count immediate;
  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 2 then
    raise exception 'approve pending expected count 2, got %', v_count;
  end if;

  begin
    perform public.delete_comment_tx(v_visible, v_post_b);
    raise exception 'wrong-parent delete unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'wrong-parent delete unexpectedly succeeded' then
        raise;
      end if;
  end;
  if not exists (select 1 from public.comments where id = v_visible) then
    raise exception 'wrong-parent delete removed the comment';
  end if;
  select comments_count into v_count from public.posts where id = v_post_b;
  if v_count <> 0 then
    raise exception 'wrong-parent delete changed post B count to %', v_count;
  end if;

  set constraints sync_visible_comment_count deferred;
  perform public.moderator_review_comment_tx(
    v_visible, 'quarantine', 'batch-4-moderator', '{}', 'quarantine', false
  );
  set constraints sync_visible_comment_count immediate;
  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 1 then
    raise exception 'quarantine visible expected count 1, got %', v_count;
  end if;

  set constraints sync_visible_comment_count deferred;
  select public.create_comment_tx(
    v_post_a, 'batch-4-owner', 'pending reject', 0, 0, now(), now(),
    false, true, null, null, 'test'
  ) into v_pending;
  perform public.moderator_review_comment_tx(
    v_pending, 'reject', 'batch-4-moderator', '{}', 'reject', false
  );
  set constraints sync_visible_comment_count immediate;
  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 1 then
    raise exception 'reject pending changed visible count to %', v_count;
  end if;

  set constraints sync_visible_comment_count deferred;
  select public.create_comment_tx(
    v_post_a, 'batch-4-owner', 'visible delete', 0, 0, now(), now(),
    false, false, null, null, 'test'
  ) into v_visible;
  perform public.delete_comment_tx(v_visible, v_post_a);
  set constraints sync_visible_comment_count immediate;
  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 1 then
    raise exception 'delete visible expected count 1, got %', v_count;
  end if;

  set constraints sync_visible_comment_count deferred;
  select public.create_comment_tx(
    v_post_a, 'batch-4-owner', 'visible report hide', 0, 0, now(), now(),
    false, false, null, null, 'test'
  ) into v_visible;
  update public.comments set is_pending = true where id = v_visible;
  set constraints sync_visible_comment_count immediate;
  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 1 then
    raise exception 'report-hide transition expected count 1, got %', v_count;
  end if;

  begin
    perform public.delete_comment_tx(gen_random_uuid(), v_post_a);
    raise exception 'missing-comment delete unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'missing-comment delete unexpectedly succeeded' then
        raise;
      end if;
  end;
  select comments_count into v_count from public.posts where id = v_post_a;
  if v_count <> 1 then
    raise exception 'missing-comment delete changed count to %', v_count;
  end if;

  begin
    insert into public.comments (post_id, user_id, text)
    values (gen_random_uuid(), 'batch-4-owner', 'orphan');
    raise exception 'orphan comment unexpectedly succeeded';
  exception
    when foreign_key_violation then null;
  end;

  begin
    insert into public.posts (user_id, text)
    values ('batch-4-owner', repeat('x', 2049));
    raise exception 'oversized post unexpectedly succeeded';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.comments (post_id, user_id, text)
    values (v_post_a, 'batch-4-owner', repeat('x', 501));
    raise exception 'oversized comment unexpectedly succeeded';
  exception
    when check_violation then null;
  end;

  raise notice 'Batch 4 local DB contract checks passed';
end;
$$;

rollback;
