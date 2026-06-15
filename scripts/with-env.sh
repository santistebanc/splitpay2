#!/usr/bin/env bash
# Loads KEY=value lines from an env file, then execs a command.
set -euo pipefail

ENV_FILE="${1:?Usage: with-env.sh <env-file> <command> [args...]}"
shift

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  echo "" >&2
  case "$ENV_FILE" in
    *dev.local)
      echo "Copy env/dev.example → env/dev.local and add your hosted Supabase + PowerSync URLs." >&2
      echo "See docs/REMOTE-DEV.md" >&2
      ;;
    *local.local)
      echo "Copy env/local.example → env/local.local" >&2
      ;;
  esac
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  if [[ "$line" != *=* ]]; then
    echo "Skipping invalid line in $ENV_FILE: $line" >&2
    continue
  fi
  export "$line"
done < "$ENV_FILE"

exec "$@"
