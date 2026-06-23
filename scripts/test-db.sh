#!/usr/bin/env bash

set -euo pipefail

readonly PROJECT_ID="$(
  sed -n 's/^project_id = "\([^"]*\)"/\1/p' supabase/config.toml | head -n 1
)"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Could not read project_id from supabase/config.toml" >&2
  exit 1
fi

readonly DB_CONTAINER="supabase_db_${PROJECT_ID}"
readonly SQL_TESTS=(
  "supabase/tests/batch_4_comment_integrity.sql"
  "supabase/tests/batch_5_like_target_state.sql"
  "supabase/tests/batch_9_db_security.sql"
)

if ! docker inspect "${DB_CONTAINER}" >/dev/null 2>&1; then
  echo "Local Supabase database container '${DB_CONTAINER}' is not running." >&2
  echo "Start Supabase or run: npx supabase db reset" >&2
  exit 1
fi

for sql_test in "${SQL_TESTS[@]}"; do
  echo "Running ${sql_test}"
  docker exec -i "${DB_CONTAINER}" \
    psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
    < "${sql_test}"
done

echo "Checking dev admin seed guard"
if docker exec -i "${DB_CONTAINER}" \
  psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  < "supabase/seeds/dev_admin.sql" >/tmp/hexoo-dev-admin-seed-unguarded.log 2>&1; then
  echo "dev_admin.sql unexpectedly ran without the local guard setting" >&2
  exit 1
fi

echo "Checking guarded dev admin seed local execution"
{
  echo "begin;"
  echo "set local hexoo.allow_dev_admin_seed = 'true';"
  cat "supabase/seeds/dev_admin.sql"
  echo "rollback;"
} | docker exec -i "${DB_CONTAINER}" \
  psql -U postgres -d postgres -v ON_ERROR_STOP=1

echo "Checking Supabase generated types drift"
bash scripts/check-supabase-types-drift.sh

echo "Database contract tests passed."
