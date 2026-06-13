#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

patterns=(
  "splitpay-test-*.db"
  "splitpay-test-*.db-shm"
  "splitpay-test-*.db-wal"
  "sync-a-*.db"
  "sync-a-*.db-shm"
  "sync-a-*.db-wal"
  "sync-b-*.db"
  "sync-b-*.db-shm"
  "sync-b-*.db-wal"
  "splitpay-*.db"
  "splitpay-*.db-shm"
  "splitpay-*.db-wal"
  "debug-sync.db"
  "debug-sync.db-shm"
  "debug-sync.db-wal"
)

removed=0
for pattern in "${patterns[@]}"; do
  for file in $pattern; do
    if [[ -e "$file" ]]; then
      rm -f "$file"
      removed=$((removed + 1))
    fi
  done
done

echo "Removed $removed test database file(s) from $ROOT"
