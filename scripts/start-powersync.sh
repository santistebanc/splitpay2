#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NETWORK="${POWERSYNC_DOCKER_NETWORK:-supabase_network_splitpay2}"

docker rm -f splitpay-powersync >/dev/null 2>&1 || true

docker run -d \
  -p 8080:8080 \
  -v "$ROOT/powersync/config.yaml:/config/config.yaml:ro" \
  -v "$ROOT/powersync/sync-rules.yaml:/config/sync-rules.yaml:ro" \
  -e POWERSYNC_CONFIG_PATH=/config/config.yaml \
  --network "$NETWORK" \
  --name splitpay-powersync \
  journeyapps/powersync-service:latest

echo "PowerSync listening on http://127.0.0.1:8080"
