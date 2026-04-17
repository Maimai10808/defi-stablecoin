#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
CHAIN_ID="${CHAIN_ID:-31337}"
PRIVATE_KEY="${PRIVATE_KEY:-}"
ADDRESS_FILE="./web/lib/contracts/addresses/${CHAIN_ID}.json"

if [ -z "${PRIVATE_KEY}" ]; then
  echo "PRIVATE_KEY is not set."
  echo "Create .env from .env.example first."
  exit 1
fi

echo "==> Building contracts..."
forge build

echo "==> Deploying contracts..."
forge script script/DeployDSC.s.sol:DeployDSC \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast

echo "==> Syncing ABIs..."
./tools/sync-abi.sh

echo "==> Checking frontend addresses..."
if [ ! -f "$ADDRESS_FILE" ]; then
  echo "Address file not found: $ADDRESS_FILE"
  exit 1
fi

cat "$ADDRESS_FILE"
echo
echo "==> deploy-local-and-sync done."
