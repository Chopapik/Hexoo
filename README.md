<p align="center">
  <img src="logo-animated.svg" alt="Hexoo logo" width="100%">
</p>

Hexoo is a social platform built with Next.js and Supabase. Users can create posts, comment, like content, and manage profiles, with moderat≠=ion and security protections built into the API layer.

## Tech Stack

- Next.js 16 + React 19
- Supabase (Auth, Postgres, Storage)
- TanStack React Query + Redux Toolkit
- Tailwind CSS 4
- Zod
- Google reCAPTCHA v3
- OpenAI moderation integration

## Prerequisites

- Node.js (latest LTS recommended)
- npm
- Supabase project
- reCAPTCHA v3 keys

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.sample` and fill required values.

3. Start development server:

```bash
npm run dev
```

## Environment Variables

Use `.env.sample` as the source of truth. Main required variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
APP_ENV=development

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

OPENAI_API_KEY=
```

## Notes

- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-side code.
- Never expose secrets with the `NEXT_PUBLIC_` prefix.

## License

This repository is source-available for viewing and reference only.
No permission is granted to copy, modify, redistribute, or use this code, in whole or in part, without prior written permission from the author.
