#!/usr/bin/env bash
set -euo pipefail

ADDRESSES_FILE="./web/lib/contracts/addresses/31337.json"

./tools/deploy-local-and-sync.sh
./tools/seed-local-state.sh

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed."
  exit 1
fi

if [ ! -f "$ADDRESSES_FILE" ]; then
  echo "Error: addresses file not found: $ADDRESSES_FILE"
  exit 1
fi

RPC_URL="http://127.0.0.1:8545"
CHAIN_ID="$(jq -r '.chainId' "$ADDRESSES_FILE")"
DSC_ENGINE="$(jq -r '.dscEngine' "$ADDRESSES_FILE")"
DSC="$(jq -r '.dsc' "$ADDRESSES_FILE")"
WETH="$(jq -r '.weth' "$ADDRESSES_FILE")"
WBTC="$(jq -r '.wbtc' "$ADDRESSES_FILE")"
ETH_USD_FEED="$(jq -r '.ethUsdPriceFeed' "$ADDRESSES_FILE")"
BTC_USD_FEED="$(jq -r '.btcUsdPriceFeed' "$ADDRESSES_FILE")"

TARGET="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
TARGET_PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

LIQUIDATOR="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
LIQUIDATOR_PK="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

cat > .local-dev.env <<EOF
export RPC_URL=$RPC_URL
export CHAIN_ID=$CHAIN_ID
export DSC_ENGINE=$DSC_ENGINE
export DSC=$DSC
export WETH=$WETH
export WBTC=$WBTC
export ETH_USD_FEED=$ETH_USD_FEED
export BTC_USD_FEED=$BTC_USD_FEED

export TARGET=$TARGET
export TARGET_PK=$TARGET_PK

export LIQUIDATOR=$LIQUIDATOR
export LIQUIDATOR_PK=$LIQUIDATOR_PK
EOF

echo
echo "==> Local dev reset completed."
echo "==> Wrote .local-dev.env"
echo "Run: source ./.local-dev.env"
