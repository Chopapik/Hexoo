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

- **Live demo:** [Link](https://demo.hexoo.eu/)

## Design

The interface is designed in Figma and includes application screens, reusable components, responsive layouts, and interaction states.

**Figma design:** https://www.figma.com/design/KurhjgFX2T3eJUp7jLIatB/HEXOO-Design-v-2.0?node-id=149-7692&p=f&t=uI8gbdBg5yeufQ2Y-0

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

- Next.js
- React
- TypeScript
- Supabase
- PostgreSQL
- Tailwind CSS
- TanStack Query
- Zustand
- Zod
- OpenAI API
- reCAPTCHA

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
