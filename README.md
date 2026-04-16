# Hexoo

![Hexoo logo](./logo-animated.svg)

Hexoo is a social platform built with Next.js and Supabase. The app includes authentication, posts, comments, likes, user profiles, moderation flows, and protected API routes.

## Tech stack

- **Framework:** Next.js 16 + React 19
- **Backend / BaaS:** Supabase (Auth, Postgres, Storage)
- **Client state:** Zustand
- **Server / async state:** TanStack React Query
- **Styling:** Tailwind CSS 4
- **Validation:** Zod
- **Security:** Google reCAPTCHA v3
- **Moderation:** OpenAI moderation integration

## Main features

- User authentication (login and registration)
- Posts, comments, and likes
- User profile pages
- Admin and moderator areas
- API protection and request throttling
- Content moderation and security-focused server flows

## Prerequisites

Before running the project, make sure you have:

- **Node.js** — latest LTS recommended
- **npm**
- A **Supabase project**
- **Google reCAPTCHA v3** keys
- An **OpenAI API key** for moderation features

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.sample .env.local
```

3. Fill in the required values in `.env.local`.

4. Start the development server:

```bash
npm run dev
```

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Environment variables

Use `.env.sample` as the source of truth.

```env
# app
NEXT_PUBLIC_API_URL=
APP_ENV=development

# supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# optional alias used in some deployments
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=

# google reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# moderation
OPENAI_API_KEY=
```

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side code.
- Never expose private secrets to the client.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is optional and exists as a compatibility alias for some deployments.
- Route access is guarded through `src/proxy.ts`.
- Local Supabase seeds are split into `supabase/seeds/base.sql` (neutral fixtures) and `supabase/seeds/dev_admin.sql` (development admin account).

## License

This repository is source-available for viewing and reference only.
No permission is granted to copy, modify, redistribute, or use this code, in whole or in part, without prior written permission from the author.
