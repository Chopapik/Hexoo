-- Complete Batch 3/4: canonical content status, atomic moderation evidence,
-- and the remaining application-backed text constraints.

do $$ begin
  create type public.content_status as enum (
    'visible', 'pending', 'quarantined', 'rejected'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.posts
  add column if not exists status public.content_status;
alter table public.comments
  add column if not exists status public.content_status;

update public.posts
set status = case when is_pending then 'pending' else 'visible' end::public.content_status
where status is null;
update public.comments
set status = case when is_pending then 'pending' else 'visible' end::public.content_status
where status is null;

alter table public.posts
  alter column status set default 'visible',
  alter column status set not null;
alter table public.comments
  alter column status set default 'visible',
  alter column status set not null;

alter table public.moderation_logs
  add column if not exists previous_status public.content_status,
  add column if not exists new_status public.content_status;

create index if not exists posts_status_created_at
  on public.posts (status, created_at desc);
create index if not exists comments_status_created_at
  on public.comments (status, created_at desc);

-- moderation_context is a write-only transaction envelope. The BEFORE trigger
-- persists its evidence and clears it, so rows never retain a second status
-- source. Application service-role writes use this for AI create/edit.
alter table public.posts
  add column if not exists moderation_context jsonb;
alter table public.comments
  add column if not exists moderation_context jsonb;

create or replace function public.apply_content_status_and_audit()
returns trigger
language plpgsql
as $$
declare
  v_context jsonb;
begin
  if tg_op = 'INSERT' then
    if new.is_pending then
      new.status := 'pending';
    else
      new.is_pending := new.status <> 'visible';
    end if;
  elsif new.status is distinct from old.status then
    new.is_pending := new.status <> 'visible';
  elsif new.is_pending is distinct from old.is_pending then
    new.status := case
      when new.is_pending then 'pending'
      else 'visible'
    end::public.content_status;
  end if;

  v_context := new.moderation_context;
  new.moderation_context := null;

  if v_context is not null then
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
      reason_details,
      previous_status,
      new_status
    ) values (
      new.user_id,
      coalesce((v_context ->> 'timestamp')::timestamptz, now()),
      v_context ->> 'verdict',
      coalesce(
        array(select jsonb_array_elements_text(v_context -> 'categories')),
        '{}'
      ),
      v_context ->> 'actionTaken',
      case when tg_table_name = 'posts' then 'post' else 'comment' end,
      new.id,
      v_context ->> 'source',
      nullif(v_context ->> 'actorId', ''),
      nullif(v_context ->> 'reasonSummary', ''),
      case
        when v_context ? 'evidence' then jsonb_build_object(
          'summary', nullif(v_context ->> 'reasonDetails', ''),
          'evidence', v_context -> 'evidence'
        )::text
        else nullif(v_context ->> 'reasonDetails', '')
      end,
      case when tg_op = 'UPDATE' then old.status else null end,
      new.status
    );
  end if;

  return new;
end;
$$;

drop trigger if exists posts_content_status_audit on public.posts;
create trigger posts_content_status_audit
before insert or update on public.posts
for each row execute function public.apply_content_status_and_audit();

drop trigger if exists comments_content_status_audit on public.comments;
create trigger comments_content_status_audit
before insert or update on public.comments
for each row execute function public.apply_content_status_and_audit();

-- Extend the existing atomic comment-create RPC with the transient moderation
-- envelope. The deferred reconciliation trigger remains the counter authority.
drop function if exists public.create_comment_tx(
  uuid, text, text, int, int, timestamptz, timestamptz,
  boolean, boolean, text, jsonb, text
);

create function public.create_comment_tx(
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
  p_device text,
  p_moderation_context jsonb default null
) returns uuid
language plpgsql
as $$
declare
  v_comment_id uuid;
begin
  if p_post_id is null then raise exception 'post_id is required'; end if;
  if p_user_id is null or btrim(p_user_id) = '' then
    raise exception 'user_id is required';
  end if;

  insert into public.comments (
    post_id, user_id, text, likes_count, comments_count, created_at,
    updated_at, is_nsfw, is_pending, status, image_url, image_meta, device,
    moderation_context
  ) values (
    p_post_id, p_user_id, coalesce(p_text, ''), coalesce(p_likes_count, 0),
    coalesce(p_comments_count, 0), coalesce(p_created_at, now()), p_updated_at,
    coalesce(p_is_nsfw, false), coalesce(p_is_pending, false),
    case when coalesce(p_is_pending, false) then 'pending' else 'visible' end,
    p_image_url, p_image_meta, p_device, p_moderation_context
  ) returning id into v_comment_id;

  if not exists (select 1 from public.posts where id = p_post_id) then
    raise exception 'Post % not found', p_post_id;
  end if;

  return v_comment_id;
end;
$$;

-- Moderator RPCs already update content and insert the audit row in one DB
-- transaction. This trigger makes their persisted status canonical, including
-- the legacy quarantine representation.
create or replace function public.apply_moderation_log_content_status()
returns trigger
language plpgsql
as $$
declare
  v_status public.content_status;
begin
  if new.resource_type not in ('post', 'comment') or new.resource_id is null then
    return new;
  end if;

  -- AI and report-threshold decisions already write canonical status and log
  -- through apply_content_status_and_audit in the same row statement.
  if new.source in ('ai', 'user_report') then
    return new;
  end if;

  v_status := case
    when lower(new.verdict) = 'rejected' then 'rejected'
    when lower(new.verdict) = 'approved' then 'visible'
    when lower(coalesce(new.reason_summary, '')) like '%quarantin%' then 'quarantined'
    else 'pending'
  end::public.content_status;

  if new.resource_type = 'post' then
    update public.posts
    set status = v_status,
        is_pending = v_status <> 'visible'
    where id = new.resource_id;
  else
    update public.comments
    set status = v_status,
        is_pending = v_status <> 'visible'
    where id = new.resource_id;
  end if;

  return new;
end;
$$;

drop trigger if exists moderation_log_content_status on public.moderation_logs;
create trigger moderation_log_content_status
after insert on public.moderation_logs
for each row execute function public.apply_moderation_log_content_status();

-- Serialize moderator intent before entering the legacy transaction functions.
-- This closes the service pre-read race and makes reject-after-delete retry a
-- deterministic no-op while preserving later different transitions.
create or replace function public.moderator_review_content_guarded_tx(
  p_resource_type text,
  p_resource_id uuid,
  p_action text,
  p_moderator_uid text,
  p_categories text[],
  p_justification text,
  p_ban_author boolean default false
) returns jsonb
language plpgsql
as $$
declare
  v_status public.content_status;
  v_target_status public.content_status;
  v_result jsonb;
begin
  if p_resource_type not in ('post', 'comment') then
    raise exception 'Unsupported resource_type: %', p_resource_type;
  end if;
  if p_action not in ('approve', 'reject', 'quarantine') then
    raise exception 'Unsupported action: %', p_action;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_resource_type || ':' || p_resource_id::text, 0)
  );

  if p_resource_type = 'post' then
    select status into v_status
    from public.posts where id = p_resource_id for update;
  else
    select status into v_status
    from public.comments where id = p_resource_id for update;
  end if;

  if v_status is null then
    if p_action = 'reject' and exists (
      select 1 from public.moderation_logs
      where resource_type = p_resource_type
        and resource_id = p_resource_id
        and source = 'moderator'
        and lower(verdict) = 'rejected'
    ) then
      return jsonb_build_object('noOp', true);
    end if;
    raise exception '% % not found', initcap(p_resource_type), p_resource_id;
  end if;

  if (p_action = 'approve' and v_status = 'visible')
    or (p_action = 'quarantine' and v_status = 'quarantined') then
    return jsonb_build_object('noOp', true);
  end if;

  v_target_status := case p_action
    when 'approve' then 'visible'
    when 'quarantine' then 'quarantined'
    else 'rejected'
  end::public.content_status;

  if p_resource_type = 'post' then
    select public.moderator_review_post_tx(
      p_resource_id, p_action, p_moderator_uid, p_categories,
      p_justification, p_ban_author
    ) into v_result;
  else
    select public.moderator_review_comment_tx(
      p_resource_id, p_action, p_moderator_uid, p_categories,
      p_justification, p_ban_author
    ) into v_result;
  end if;

  update public.moderation_logs
  set previous_status = v_status,
      new_status = v_target_status
  where id = (
    select id from public.moderation_logs
    where resource_type = p_resource_type
      and resource_id = p_resource_id
      and source = 'moderator'
      and actor_id = p_moderator_uid
    order by created_at desc, id desc
    limit 1
  );

  return coalesce(v_result, '{}'::jsonb) || jsonb_build_object('noOp', false);
end;
$$;

-- comments_count follows the canonical status, not the compatibility boolean.
create or replace function public.reconcile_visible_comment_count()
returns trigger
language plpgsql
as $$
declare
  v_post_id uuid;
begin
  if tg_op = 'UPDATE'
    and old.post_id is not distinct from new.post_id
    and old.status is not distinct from new.status then
    return null;
  end if;

  if tg_op = 'UPDATE' and old.post_id is distinct from new.post_id then
    perform id from public.posts where id = old.post_id for update;
    update public.posts
    set comments_count = (
      select count(*)::int from public.comments
      where post_id = old.post_id and status = 'visible'
    ), updated_at = now()
    where id = old.post_id;
  end if;

  v_post_id := case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  perform id from public.posts where id = v_post_id for update;
  update public.posts
  set comments_count = (
    select count(*)::int from public.comments
    where post_id = v_post_id and status = 'visible'
  ), updated_at = now()
  where id = v_post_id;
  return null;
end;
$$;

-- Remaining limits represented by application DTOs.
alter table public.users
  drop constraint if exists users_display_name_max_length,
  add constraint users_display_name_max_length
    check (char_length(display_name) <= 50),
  drop constraint if exists users_display_name_normalized_max_length,
  add constraint users_display_name_normalized_max_length
    check (char_length(display_name_normalized) <= 50);

alter table public.post_reports
  drop constraint if exists post_reports_details_max_length,
  add constraint post_reports_details_max_length
    check (details is null or char_length(details) <= 300);

alter table public.comment_reports
  drop constraint if exists comment_reports_details_max_length,
  add constraint comment_reports_details_max_length
    check (details is null or char_length(details) <= 300);

alter table public.moderation_logs
  drop constraint if exists moderation_logs_reason_summary_max_length,
  add constraint moderation_logs_reason_summary_max_length
    check (reason_summary is null or char_length(reason_summary) <= 500),
  drop constraint if exists moderation_logs_reason_details_max_length,
  add constraint moderation_logs_reason_details_max_length
    check (reason_details is null or char_length(reason_details) <= 4000),
  drop constraint if exists moderation_logs_resource_type_check,
  add constraint moderation_logs_resource_type_check
    check (resource_type is null or resource_type in ('post', 'comment')),
  drop constraint if exists moderation_logs_source_check,
  add constraint moderation_logs_source_check
    check (source is null or source in ('ai', 'user_report', 'moderator'));

-- Intentional FK exemptions under DEC-010 tombstone retention:
-- posts.user_id/comments.user_id remain stable author identifiers after the
-- private users row is anonymized or removed. Polymorphic likes.parent_id and
-- moderation_logs.resource_id cannot use one ordinary FK. Resource-specific
-- report FKs and comments.post_id remain enforced with ON DELETE CASCADE.
