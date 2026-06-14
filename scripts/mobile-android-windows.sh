#!/usr/bin/env bash
# Trigger Android build via Windows npm on a native C:\ clone (for ARM WSL + Windows dev).
set -euo pipefail

WIN_REPO="${WINDOWS_REPO:-/mnt/c/Users/santi/code/splitpay2}"

if [[ ! -f "$WIN_REPO/package.json" ]]; then
  echo "Windows repo not found at: $WIN_REPO"
  echo ""
  echo "Clone the repo to native Windows disk first:"
  echo "  git clone <repo-url> C:\\Users\\santi\\code\\splitpay2"
  echo "  cd C:\\Users\\santi\\code\\splitpay2 && npm install"
  echo ""
  echo "Then sync your WSL changes (git push/pull or copy) and re-run:"
  echo "  npm run mobile:android:win"
  echo ""
  echo "Override path: WINDOWS_REPO=/mnt/c/Users/you/code/splitpay2 npm run mobile:android:win"
  exit 1
fi

# Convert /mnt/c/... to C:\... for cmd.exe
WIN_PATH="$(wslpath -w "$WIN_REPO")"

echo "Building via Windows npm at: $WIN_PATH"
cmd.exe /c "cd /d \"$WIN_PATH\" && npm run mobile:android"
