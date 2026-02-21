drop table if exists public.content_reports;

alter table public.posts drop column if exists user_reports;
alter table public.posts drop column if exists reports_meta;

alter table public.comments drop column if exists user_reports;
alter table public.comments drop column if exists reports_meta;
