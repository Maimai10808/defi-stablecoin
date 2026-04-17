#!/usr/bin/env bash
set -euo pipefail

./tools/deploy-local-and-sync.sh
./tools/seed-local-state.sh

echo
echo "==> Local dev reset completed."
