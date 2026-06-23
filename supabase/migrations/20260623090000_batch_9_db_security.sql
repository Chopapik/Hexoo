-- Batch 9: explicit DB security model for public schema exposure.
--
-- Application mutations go through server-side authorization and the Supabase
-- service role. Browser clients must not mutate public tables or execute
-- backend/admin/moderator RPCs directly.

grant usage on schema public to anon, authenticated, service_role;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from public, anon, authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.post_reports enable row level security;
alter table public.comment_reports enable row level security;
alter table public.moderation_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.account_deletion_jobs enable row level security;

drop policy if exists users_service_role_all on public.users;
create policy users_service_role_all
  on public.users for all to service_role
  using (true) with check (true);

drop policy if exists posts_service_role_all on public.posts;
create policy posts_service_role_all
  on public.posts for all to service_role
  using (true) with check (true);

drop policy if exists comments_service_role_all on public.comments;
create policy comments_service_role_all
  on public.comments for all to service_role
  using (true) with check (true);

drop policy if exists likes_service_role_all on public.likes;
create policy likes_service_role_all
  on public.likes for all to service_role
  using (true) with check (true);

drop policy if exists post_reports_service_role_all on public.post_reports;
create policy post_reports_service_role_all
  on public.post_reports for all to service_role
  using (true) with check (true);

drop policy if exists comment_reports_service_role_all on public.comment_reports;
create policy comment_reports_service_role_all
  on public.comment_reports for all to service_role
  using (true) with check (true);

drop policy if exists moderation_logs_service_role_all on public.moderation_logs;
create policy moderation_logs_service_role_all
  on public.moderation_logs for all to service_role
  using (true) with check (true);

drop policy if exists activity_logs_service_role_all on public.activity_logs;
create policy activity_logs_service_role_all
  on public.activity_logs for all to service_role
  using (true) with check (true);

drop policy if exists account_deletion_jobs_service_role_all on public.account_deletion_jobs;
create policy account_deletion_jobs_service_role_all
  on public.account_deletion_jobs for all to service_role
  using (true) with check (true);

-- Public RPCs are not a client API. Actor-bearing parameters remain safe only
-- because execute is restricted to the backend service role boundary.
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

grant execute on function public.set_like_state_tx(text, text, text, boolean) to service_role;
grant execute on function public.create_comment_tx(
  uuid, text, text, integer, integer, timestamptz, timestamptz,
  boolean, boolean, text, jsonb, text, jsonb
) to service_role;
grant execute on function public.delete_comment_tx(uuid, uuid) to service_role;
grant execute on function public.moderator_block_user_tx(text, text, text) to service_role;
grant execute on function public.moderator_unblock_user_tx(text, text) to service_role;
grant execute on function public.moderator_review_post_tx(
  uuid, text, text, text[], text, boolean
) to service_role;
grant execute on function public.moderator_review_comment_tx(
  uuid, text, text, text[], text, boolean
) to service_role;
grant execute on function public.moderator_review_content_guarded_tx(
  text, uuid, text, text, text[], text, boolean
) to service_role;
grant execute on function public.begin_account_deletion(text) to service_role;
grant execute on function public.complete_account_deletion_step(text, text) to service_role;
grant execute on function public.record_account_deletion_failure(text, text, text) to service_role;
