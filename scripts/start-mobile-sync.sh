#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LAN_IP="$(bash "$ROOT/scripts/lan-ip.sh")"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0}"

echo "Sync URLs for phone (same Wi‑Fi as this machine):"
echo "  Supabase:  http://${LAN_IP}:54321"
echo "  PowerSync: http://${LAN_IP}:8080"
echo ""
echo "If the phone cannot reach those URLs, set LAN_IP to your PC Wi‑Fi address"
echo "(Windows: ipconfig → IPv4) and re-run: LAN_IP=192.168.x.x npm run mobile:sync"
echo ""

export EXPO_PUBLIC_SUPABASE_URL="http://${LAN_IP}:54321"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
export EXPO_PUBLIC_POWERSYNC_URL="http://${LAN_IP}:8080"

cd "$ROOT"
exec npm run start:tunnel --workspace=@splitpay/mobile
