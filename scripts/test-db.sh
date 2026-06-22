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

echo "Database contract tests passed."
