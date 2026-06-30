<p align="center">
  <img src="./src/features/shared/assets/Logo.svg" alt="Hexoo logo" />
</p>

<p align="center">
  <img src="./docs/images/header-preview.png" alt="Hexoo preview" width="70%" />
</p>

# Hexoo

Hexoo is a lightweight full-stack social posting app focused on a simple chronological feed, quick interactions, user profiles, image upload, comments, reactions, and content moderation.

The project started as a learning project and gradually evolved into a more complete portfolio-ready web application with authentication, user-generated content, reusable UI components, moderation flows, backend integration, and production deployment.

The app is built around a simple product idea: posting should feel direct, fast, and low-pressure. There are no recommendation algorithms, no engagement ranking, and no manipulated feed order — just a straightforward timeline and moderation tools for handling reported or harmful content.

## Live demo

A public demo version of Hexoo is available here:

**Live demo:** [Link](https://demo.hexoo.eu/)

You can test the app in two ways:

1. Create your own account using the registration flow.
2. Use the shared demo account:

| Field    | Value           |
| -------- | --------------- |
| Email    | `demo@hexoo.eu` |
| Password | `demo1234`      |

This is a public demo environment. Please do not enter private information or real personal data.

Demo data is reset automatically. Test accounts, uploaded images, posts, comments and reactions created by visitors may be removed during the next reset. The reset restores a curated demo state with example posts, comments and images.

## Design

The interface is designed in Figma and includes application screens, reusable components, responsive layouts, and interaction states.

**Figma design:** [Link](https://www.figma.com/design/KurhjgFX2T3eJUp7jLIatB/HEXOO-Design-v-2.0?node-id=149-7692&p=f&t=uI8gbdBg5yeufQ2Y-0)

<img src="./docs/images/figma.png" alt="Figma" width="50%" style="border-radius:14px;" />

## Main features

- User registration and login
- Chronological post feed
- Text posts, image posts, and YouTube link support
- Comments and reactions
- User profiles
- Basic moderator flow for content review
- Content moderation support
- reCAPTCHA protection
- Responsive interface
- Reusable UI components
- Production deployment

## Tech stack

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://nextjs.org/_next/static/immutable/media/nextjs-logotype-dark.3h4a2z2v_dkod.svg" height="40" alt="Next.js" />
      <br />
      <sub>Next.js</sub>
    </td>
    <td align="center" width="120">
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" height="40" alt="React" />
      <br />
      <sub>React</sub>
    </td>
<td align="center" width="120">
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg"
    height="40"
    alt="TypeScript"
  />
  <br />
  <sub>TypeScript</sub>
</td>
    <td align="center" width="120">
      <img src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.0~s.iziag2xd..svg" height="40" alt="Tailwind CSS" />
      <br />
      <sub>Tailwind CSS</sub>
    </td>
  </tr>

  <tr>
    <td align="center" width="140">
      <img
        src="https://supabase.com/dashboard/img/supabase-dark.svg"
        height="40"
        alt="Supabase"
      />
      <br />
      <sub>Supabase</sub>
    </td>
    <td align="center" width="120">
      <img src="https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg" height="40" alt="PostgreSQL" />
      <br />
      <sub>PostgreSQL</sub>
    </td>
    <td align="center" width="120">
      <img src="https://upstash.com/logo/redis-icon.svg" height="40" alt="Upstash Redis" />
      <br />
      <sub>Upstash Redis</sub>
    </td>
<td align="center" width="140">
  <img
    src="https://cdn.simpleicons.org/vercel/white"
    height="40"
    alt="Vercel"
  />
  <br />
  <sub>Vercel</sub>
</td>
  </tr>

  <tr>
    <td align="center" width="120">
      <img src="https://tanstack.com/images/logos/logo-black.svg" height="40" alt="TanStack Query" />
      <br />
      <sub>TanStack Query</sub>
    </td>
    <td align="center" width="120">
      <img
        src="https://user-images.githubusercontent.com/958486/218346783-72be5ae3-b953-4dd7-b239-788a882fdad6.svg"
        alt="Zustand"
        height="40"
      />
      <br />
      <sub>Zustand</sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/colinhacks/zod/main/logo.svg" height="40" alt="Zod" />
      <br />
      <sub>Zod</sub>
    </td>
    <td align="center" width="120">
      <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" height="40" alt="reCAPTCHA" />
      <br />
      <sub>reCAPTCHA</sub>
    </td>
  </tr>

  <tr>
    <td align="center" width="170">
  <img
        src="./docs/assets/openai-wordmark-white.svg" height="40"
    alt="OpenAI"

<br />
<sub>omni-moderation-latest</sub>

</td>
  </tr>
</table>

## Engineering scope

Hexoo includes several areas commonly found in real-world web applications:

- authentication and protected user flows
- session handling with Supabase Auth and cookies
- user-generated content stored in a PostgreSQL-backed database
- posts, comments, reactions, profiles, and image upload
- role-based flows for users, moderators, and administrators
- moderation queue, reports, decisions, and activity logs
- form validation and typed data handling with Zod
- server-side and client-side application logic
- external API integration for automated content moderation
- reusable frontend components and responsive UI implementation
- deployment-ready configuration

## Project structure

```txt
src/
  app/          Next.js app routes
  features/     Feature-based application modules
  lib/          Shared utilities and integrations
  styles/       Global styles

supabase/       Supabase-related configuration and database files
docs/           Project images and documentation assets
```

Local setup instructions are intentionally omitted because the application depends on private environment variables, Supabase configuration, external API keys, and production-specific services.

## License

This repository is source-available for viewing and reference only.

No permission is granted to copy, modify, redistribute, sublicense, or use this code, in whole or in part, without prior written permission from the author.
