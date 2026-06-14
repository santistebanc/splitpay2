#!/usr/bin/env bash
# Best-effort LAN IP for devices on the same Wi‑Fi (phone → dev machine).
# Override: LAN_IP=192.168.1.42 npm run mobile:sync

if [[ -n "${LAN_IP:-}" ]]; then
  echo "$LAN_IP"
  exit 0
fi

if command -v ip >/dev/null 2>&1; then
  ip route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($i=="src") { print $(i+1); exit }}'
  exit 0
fi

if [[ -f /etc/resolv.conf ]]; then
  awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf
  exit 0
fi

echo "127.0.0.1"
