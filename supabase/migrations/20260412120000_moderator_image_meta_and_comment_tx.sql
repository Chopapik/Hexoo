-- Post review: return full image_meta for storage cleanup (bucket + location + fileName).
create or replace function public.moderator_review_post_tx(
  p_post_id uuid,
  p_action text,
  p_moderator_uid text,
  p_categories text[],
  p_justification text,
  p_ban_author boolean default false
) returns jsonb
language plpgsql
as $$
declare
  v_post public.posts%rowtype;
  v_verdict text;
  v_action_taken text;
begin
  if p_post_id is null then
    raise exception 'post_id is required';
  end if;

  if p_action not in ('approve', 'reject', 'quarantine') then
    raise exception 'Unsupported action: %', p_action;
  end if;

  select *
  into v_post
  from public.posts
  where id = p_post_id
  for update;

  if not found then
    raise exception 'Post % not found', p_post_id;
  end if;

  if p_action = 'reject' then
    delete from public.posts where id = p_post_id;
    v_verdict := 'REJECTED';
    v_action_taken := 'CONTENT_REMOVED';
  elsif p_action = 'approve' then
    update public.posts
    set is_pending = false
    where id = p_post_id;
    v_verdict := 'APPROVED';
    v_action_taken := 'FLAGGED_FOR_REVIEW';
  else
    update public.posts
    set is_pending = true
    where id = p_post_id;
    v_verdict := 'PENDING';
    v_action_taken := 'FLAGGED_FOR_REVIEW';
  end if;

  insert into public.moderation_logs (
    user_id,
    "timestamp",
    verdict,
    categories,
    action_taken,
    resource_type,
    resource_id,
    source,
    actor_id,
    reason_summary,
    reason_details
  ) values (
    v_post.user_id,
    now(),
    v_verdict,
    coalesce(p_categories, '{}'),
    v_action_taken,
    'post',
    p_post_id,
    'moderator',
    p_moderator_uid,
    case
      when p_action = 'reject' then 'Post removed by moderator'
      when p_action = 'approve' then 'Post approved by moderator'
      else 'Post moved to quarantine by moderator'
    end,
    p_justification
  );

  insert into public.activity_logs (user_id, action, details)
  values (
    p_moderator_uid,
    'MODERATOR_REVIEWED_POST',
    format('Reviewed post %s with action %s', p_post_id::text, p_action)
  );

  if v_post.user_id is not null then
    insert into public.activity_logs (user_id, action, details)
    values (
      v_post.user_id,
      case
        when p_action = 'reject' then 'POST_REJECTED'
        when p_action = 'approve' then 'POST_APPROVED'
        else 'POST_QUARANTINED'
      end,
      case
        when p_action = 'reject' then format('Post %s rejected by moderator', p_post_id::text)
        when p_action = 'approve' then format('Post %s approved by moderator', p_post_id::text)
        else format('Post %s moved to quarantine by moderator', p_post_id::text)
      end
    );
  end if;

  if p_ban_author and v_post.user_id is not null then
    update public.users
    set
      is_banned = true,
      banned_at = now(),
      banned_by = p_moderator_uid,
      banned_reason = format('Decision on post %s', p_post_id::text),
      updated_at = now()
    where uid = v_post.user_id;

    if not found then
      raise exception 'Author % not found', v_post.user_id;
    end if;

    insert into public.activity_logs (user_id, action, details)
    values (
      v_post.user_id,
      'USER_BLOCKED',
      format('Blocked by %s. Reason: Decision on post %s', p_moderator_uid, p_post_id::text)
    );

    insert into public.activity_logs (user_id, action, details)
    values (
      p_moderator_uid,
      'MODERATOR_BLOCKED_USER',
      format('Blocked user %s', v_post.user_id)
    );
  end if;

  return jsonb_build_object(
    'deletedImageMeta',
    case when p_action = 'reject' then v_post.image_meta else null end,
    'authorUid',
    v_post.user_id
  );
end;
$$;

-- Comment moderation.
create or replace function public.moderator_review_comment_tx(
  p_comment_id uuid,
  p_action text,
  p_moderator_uid text,
  p_categories text[],
  p_justification text,
  p_ban_author boolean default false
) returns jsonb
language plpgsql
as $$
declare
  v_comment public.comments%rowtype;
  v_verdict text;
  v_action_taken text;
begin
  if p_comment_id is null then
    raise exception 'comment_id is required';
  end if;

  if p_action not in ('approve', 'reject', 'quarantine') then
    raise exception 'Unsupported action: %', p_action;
  end if;

  select *
  into v_comment
  from public.comments
  where id = p_comment_id
  for update;

  if not found then
    raise exception 'Comment % not found', p_comment_id;
  end if;

  if p_action = 'reject' then
    delete from public.comments where id = p_comment_id;
    update public.posts
    set
      comments_count = greatest(comments_count - 1, 0),
      updated_at = now()
    where id = v_comment.post_id;
    v_verdict := 'REJECTED';
    v_action_taken := 'CONTENT_REMOVED';
  elsif p_action = 'approve' then
    update public.comments
    set is_pending = false
    where id = p_comment_id;
    v_verdict := 'APPROVED';
    v_action_taken := 'FLAGGED_FOR_REVIEW';
  else
    update public.comments
    set is_pending = true
    where id = p_comment_id;
    v_verdict := 'PENDING';
    v_action_taken := 'FLAGGED_FOR_REVIEW';
  end if;

  insert into public.moderation_logs (
    user_id,
    "timestamp",
    verdict,
    categories,
    action_taken,
    resource_type,
    resource_id,
    source,
    actor_id,
    reason_summary,
    reason_details
  ) values (
    v_comment.user_id,
    now(),
    v_verdict,
    coalesce(p_categories, '{}'),
    v_action_taken,
    'comment',
    p_comment_id,
    'moderator',
    p_moderator_uid,
    case
      when p_action = 'reject' then 'Comment removed by moderator'
      when p_action = 'approve' then 'Comment approved by moderator'
      else 'Comment moved to quarantine by moderator'
    end,
    p_justification
  );

  insert into public.activity_logs (user_id, action, details)
  values (
    p_moderator_uid,
    'MODERATOR_REVIEWED_COMMENT',
    format('Reviewed comment %s with action %s', p_comment_id::text, p_action)
  );

  if v_comment.user_id is not null then
    insert into public.activity_logs (user_id, action, details)
    values (
      v_comment.user_id,
      case
        when p_action = 'reject' then 'COMMENT_REJECTED'
        when p_action = 'approve' then 'COMMENT_APPROVED'
        else 'COMMENT_QUARANTINED'
      end,
      case
        when p_action = 'reject' then format('Comment %s rejected by moderator', p_comment_id::text)
        when p_action = 'approve' then format('Comment %s approved by moderator', p_comment_id::text)
        else format('Comment %s moved to quarantine by moderator', p_comment_id::text)
      end
    );
  end if;

  if p_ban_author and v_comment.user_id is not null then
    update public.users
    set
      is_banned = true,
      banned_at = now(),
      banned_by = p_moderator_uid,
      banned_reason = format('Decision on comment %s', p_comment_id::text),
      updated_at = now()
    where uid = v_comment.user_id;

    if not found then
      raise exception 'Author % not found', v_comment.user_id;
    end if;

    insert into public.activity_logs (user_id, action, details)
    values (
      v_comment.user_id,
      'USER_BLOCKED',
      format('Blocked by %s. Reason: Decision on comment %s', p_moderator_uid, p_comment_id::text)
    );

    insert into public.activity_logs (user_id, action, details)
    values (
      p_moderator_uid,
      'MODERATOR_BLOCKED_USER',
      format('Blocked user %s', v_comment.user_id)
    );
  end if;

  return jsonb_build_object(
    'deletedImageMeta',
    case when p_action = 'reject' then v_comment.image_meta else null end,
    'authorUid',
    v_comment.user_id
  );
end;
$$;
