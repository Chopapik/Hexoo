-- Batch 7: account tombstones and durable Auth/Storage recovery.

alter table public.users
  add column if not exists deleted_at timestamptz;

create table if not exists public.account_deletion_jobs (
  user_id text primary key references public.users (uid) on delete restrict,
  avatar_meta jsonb,
  avatar_deleted_at timestamptz,
  auth_deleted_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_failed_step text check (last_failed_step is null or last_failed_step in ('avatar', 'auth', 'progress')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create or replace function public.begin_account_deletion(p_uid text)
returns public.account_deletion_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users%rowtype;
  v_job public.account_deletion_jobs%rowtype;
  v_now timestamptz := clock_timestamp();
  v_admin_count integer;
begin
  if p_uid is null or btrim(p_uid) = '' then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;

  -- One global transaction lock makes concurrent admin removals observe the
  -- result of the preceding removal before evaluating the invariant.
  perform pg_advisory_xact_lock(hashtextextended('account-deletion-admin-guard', 0));

  select * into v_user
  from public.users
  where uid = p_uid
  for update;

  if not found then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0002';
  end if;

  select * into v_job
  from public.account_deletion_jobs
  where user_id = p_uid
  for update;

  if found then
    update public.account_deletion_jobs
    set attempt_count = attempt_count + 1,
        updated_at = v_now
    where user_id = p_uid
    returning * into v_job;
    return v_job;
  end if;

  if v_user.deleted_at is not null then
    raise exception 'ACCOUNT_DELETION_JOB_MISSING' using errcode = 'P0001';
  end if;

  if v_user.role = 'admin'
    and coalesce(v_user.is_active, true)
    and not coalesce(v_user.is_banned, false) then
    select count(*)::integer into v_admin_count
    from public.users
    where role = 'admin'
      and coalesce(is_active, true)
      and not coalesce(is_banned, false)
      and deleted_at is null;

    if v_admin_count <= 1 then
      raise exception 'LAST_ACTIVE_ADMIN' using errcode = 'P0001';
    end if;
  end if;

  insert into public.account_deletion_jobs (
    user_id,
    avatar_meta,
    avatar_deleted_at,
    attempt_count,
    created_at,
    updated_at
  ) values (
    p_uid,
    v_user.avatar_meta,
    case when v_user.avatar_meta is null then v_now else null end,
    1,
    v_now,
    v_now
  ) returning * into v_job;

  update public.users
  set display_name = '',
      display_name_normalized = '',
      email = '',
      role = 'user',
      avatar_url = null,
      avatar_meta = null,
      updated_at = v_now,
      last_online = v_now,
      is_active = false,
      is_banned = false,
      banned_at = null,
      banned_by = null,
      banned_reason = null,
      is_restricted = false,
      restricted_at = null,
      restricted_by = null,
      restriction_reason = null,
      last_known_ip = null,
      session_invalidated_at = v_now,
      deleted_at = v_now
  where uid = p_uid;

  return v_job;
end;
$$;

create or replace function public.complete_account_deletion_step(
  p_uid text,
  p_step text
)
returns public.account_deletion_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.account_deletion_jobs%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  if p_step not in ('avatar', 'auth') then
    raise exception 'INVALID_ACCOUNT_DELETION_STEP' using errcode = '22023';
  end if;

  update public.account_deletion_jobs
  set avatar_deleted_at = case when p_step = 'avatar' then coalesce(avatar_deleted_at, v_now) else avatar_deleted_at end,
      avatar_meta = case when p_step = 'avatar' then null else avatar_meta end,
      auth_deleted_at = case when p_step = 'auth' then coalesce(auth_deleted_at, v_now) else auth_deleted_at end,
      last_failed_step = null,
      last_error = null,
      updated_at = v_now
  where user_id = p_uid
  returning * into v_job;

  if not found then
    raise exception 'ACCOUNT_DELETION_JOB_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_job.avatar_deleted_at is not null and v_job.auth_deleted_at is not null then
    update public.account_deletion_jobs
    set completed_at = coalesce(completed_at, v_now),
        updated_at = v_now
    where user_id = p_uid
    returning * into v_job;
  end if;

  return v_job;
end;
$$;

create or replace function public.record_account_deletion_failure(
  p_uid text,
  p_step text,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.account_deletion_jobs
  set last_failed_step = case when p_step in ('avatar', 'auth', 'progress') then p_step else 'progress' end,
      last_error = left(coalesce(p_error, 'Account deletion step failed'), 500),
      updated_at = clock_timestamp()
  where user_id = p_uid;
end;
$$;

-- Content which wins the race before anonymization is retained. New content
-- after the tombstone is rejected while preserving the intentional no-FK
-- behavior for legacy/missing author identifiers.
create or replace function public.reject_tombstoned_content_author()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_deleted_at timestamptz;
begin
  select deleted_at into v_deleted_at
  from public.users
  where uid = new.user_id
  for key share;

  if found and v_deleted_at is not null then
    raise exception 'ACCOUNT_DELETED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists posts_reject_tombstoned_author on public.posts;
create trigger posts_reject_tombstoned_author
before insert or update of user_id on public.posts
for each row execute function public.reject_tombstoned_content_author();

drop trigger if exists comments_reject_tombstoned_author on public.comments;
create trigger comments_reject_tombstoned_author
before insert or update of user_id on public.comments
for each row execute function public.reject_tombstoned_content_author();

revoke all on function public.begin_account_deletion(text) from public, anon, authenticated;
revoke all on function public.complete_account_deletion_step(text, text) from public, anon, authenticated;
revoke all on function public.record_account_deletion_failure(text, text, text) from public, anon, authenticated;
grant execute on function public.begin_account_deletion(text) to service_role;
grant execute on function public.complete_account_deletion_step(text, text) to service_role;
grant execute on function public.record_account_deletion_failure(text, text, text) to service_role;
