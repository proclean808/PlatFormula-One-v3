#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v npx >/dev/null || { echo "BLOCKED: npx unavailable"; exit 2; }
export ULTRAMEMORY_URL="${ULTRAMEMORY_URL:-http://127.0.0.1:1933}"
if ! curl --fail --silent --max-time 2 "$ULTRAMEMORY_URL/api/v1/memory/recall?query=health" >/dev/null; then
  npx --yes @ultramemory/server serve --http --port 1933 > /tmp/pf1-ultramemory-server.log 2>&1 &
  pid=$!
  trap 'kill "$pid" 2>/dev/null || true' EXIT
  for i in $(seq 1 40); do
    if curl --fail --silent --max-time 2 "$ULTRAMEMORY_URL/api/v1/memory/recall?query=health" >/dev/null; then break; fi
    if ! kill -0 "$pid" 2>/dev/null; then cat /tmp/pf1-ultramemory-server.log; exit 3; fi
    sleep 1
  done
fi
python3 verify_live.py
