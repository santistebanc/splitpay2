#!/usr/bin/env bash
# Metro for an installed Android dev build. Forwards port 8081 when adb sees a device.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if command -v adb >/dev/null 2>&1; then
  if adb devices 2>/dev/null | awk 'NR>1 && $2=="device" { found=1 } END { exit !found }'; then
    adb reverse tcp:8081 tcp:8081
    echo "Forwarded phone localhost:8081 → this machine (adb reverse)."
    echo ""
  else
    echo "No adb device — skipping adb reverse."
    echo "If the app stays blank, pair the phone (npm run mobile:adb:qr) and re-run,"
    echo "or use tunnel mode (already enabled below)."
    echo ""
  fi
fi

echo "Keep this terminal open. Open the SplitPay dev app on your phone."
echo "If the screen is still blank, shake the phone → Reload."
echo ""

cd "$ROOT"
exec npm run start:tunnel --workspace=@splitpay/mobile
