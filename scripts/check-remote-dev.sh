#!/usr/bin/env bash
# Smoke-check that env/dev.local endpoints are reachable.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT/env/dev.local}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy env/dev.example first."
  exit 1
fi

bash "$ROOT/scripts/with-env.sh" "$ENV_FILE" bash -c '
  set -euo pipefail
  echo "Supabase:  $EXPO_PUBLIC_SUPABASE_URL"
  echo "PowerSync: $EXPO_PUBLIC_POWERSYNC_URL"
  echo ""

  supabase_code="$(curl -s -o /dev/null -w "%{http_code}" "${EXPO_PUBLIC_SUPABASE_URL}/auth/v1/health" || echo "000")"
  powersync_code="$(curl -s -o /dev/null -w "%{http_code}" "${EXPO_PUBLIC_POWERSYNC_URL}" || echo "000")"

  echo "Supabase health:  HTTP $supabase_code"
  echo "PowerSync root:   HTTP $powersync_code"
  echo ""

  if [[ "$supabase_code" != "200" && "$supabase_code" != "401" ]]; then
    echo "Supabase URL is not reachable from this machine."
    exit 1
  fi

  if [[ "$powersync_code" == "000" ]]; then
    echo "PowerSync URL is not reachable from this machine."
    exit 1
  fi

  echo "Remote dev stack looks reachable."
'
