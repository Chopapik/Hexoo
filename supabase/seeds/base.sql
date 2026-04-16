-- Base seed data shared across environments.
-- Keep only neutral fixtures here (for example categories,
-- generic test users, or sample content that is safe to load everywhere).

create extension if not exists "pgcrypto";
