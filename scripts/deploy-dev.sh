#!/usr/bin/env bash
# Push Supabase migrations and deploy edge functions to the linked dev project.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli"
  exit 1
fi

if ! supabase projects list >/dev/null 2>&1; then
  echo "Run: supabase login"
  exit 1
fi

if [[ -f "$ROOT/env/dev.local" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    [[ -z "$line" ]] && continue
    [[ "$line" != *=* ]] && continue
    export "$line"
  done < "$ROOT/env/dev.local"
fi

if [[ -n "${SUPABASE_PROJECT_REF:-}" ]]; then
  supabase link --project-ref "$SUPABASE_PROJECT_REF"
fi

echo "→ Pushing database migrations..."
if ! supabase db push; then
  echo ""
  echo "Link this repo to your dev Supabase project:"
  echo "  supabase link --project-ref YOUR_PROJECT_REF"
  exit 1
fi

echo "→ Deploying join edge function..."
supabase functions deploy join

echo ""
echo "Dev Supabase deploy complete."
echo "Deploy PowerSync sync rules in the PowerSync dashboard — see docs/REMOTE-DEV.md"
