-- Users table (from UserEntity).
-- Stores profile and moderation state; auth may live in Firebase/Supabase Auth.
create table if not exists public.users (
  uid text primary key,

  display_name text not null default '',
  display_name_normalized text not null default '',

  email text not null,
  role text not null default 'user' check (role in ('admin', 'user', 'moderator')),

  avatar_url text,
  avatar_meta jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_online timestamptz not null default now(),

  is_active boolean default true,

  is_banned boolean default false,
  banned_at timestamptz,
  banned_by text,
  banned_reason text,

  is_restricted boolean default false,
  restricted_at timestamptz,
  restricted_by text,
  restriction_reason text,

  last_known_ip text
);

-- Indexes: email and last online.
create index if not exists users_email on public.users (email);
create index if not exists users_last_online on public.users (last_online desc);

create unique index if not exists users_display_name_normalized_unique
  on public.users (display_name_normalized)
  where display_name_normalized <> '';
