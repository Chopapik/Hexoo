#!/usr/bin/env bash

set -euo pipefail

readonly TMP_TYPES="$(mktemp "${TMPDIR:-/tmp}/hexoo-supabase-types.XXXXXX")"
readonly NORMALIZED_TRACKED="$(mktemp "${TMPDIR:-/tmp}/hexoo-supabase-types-tracked.XXXXXX")"
readonly NORMALIZED_GENERATED="$(mktemp "${TMPDIR:-/tmp}/hexoo-supabase-types-generated.XXXXXX")"
trap 'rm -f "${TMP_TYPES}" "${NORMALIZED_TRACKED}" "${NORMALIZED_GENERATED}"' EXIT

npx supabase gen types typescript --local > "${TMP_TYPES}"
perl -0pe 's/\n+\z/\n/' src/lib/supabase.database.types.ts > "${NORMALIZED_TRACKED}"
perl -0pe 's/\n+\z/\n/' "${TMP_TYPES}" > "${NORMALIZED_GENERATED}"
diff -u "${NORMALIZED_TRACKED}" "${NORMALIZED_GENERATED}"

echo "Supabase generated types match local migrations."
