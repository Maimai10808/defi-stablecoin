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
USER_ADDRESS="${USER_ADDRESS:-0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266}"
MINT_AMOUNT="${MINT_AMOUNT:-100000000000000000000}"
DEPOSIT_AMOUNT="${DEPOSIT_AMOUNT:-10000000000000000000}"
ADDRESS_FILE="./web/lib/contracts/addresses/${CHAIN_ID}.json"

if [ -z "${PRIVATE_KEY}" ]; then
  echo "PRIVATE_KEY is not set."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed."
  echo "Install it with: brew install jq"
  exit 1
fi

if [ ! -f "$ADDRESS_FILE" ]; then
  echo "Address file not found: $ADDRESS_FILE"
  exit 1
fi

WETH_ADDRESS="$(jq -r '.weth' "$ADDRESS_FILE")"
WBTC_ADDRESS="$(jq -r '.wbtc' "$ADDRESS_FILE")"
DSC_ADDRESS="$(jq -r '.dsc' "$ADDRESS_FILE")"
DSC_ENGINE_ADDRESS="$(jq -r '.dscEngine' "$ADDRESS_FILE")"

echo "==> Using current deployed addresses"
echo "WETH:       $WETH_ADDRESS"
echo "WBTC:       $WBTC_ADDRESS"
echo "DSC:        $DSC_ADDRESS"
echo "DSCEngine:  $DSC_ENGINE_ADDRESS"
echo "User:       $USER_ADDRESS"
echo

echo "==> Verifying code exists..."
cast code "$WETH_ADDRESS" --rpc-url "$RPC_URL" | grep -qv '^0x$' || {
  echo "No code at WETH address: $WETH_ADDRESS"
  exit 1
}
cast code "$DSC_ENGINE_ADDRESS" --rpc-url "$RPC_URL" | grep -qv '^0x$' || {
  echo "No code at DSCEngine address: $DSC_ENGINE_ADDRESS"
  exit 1
}

echo "==> Minting mock WETH..."
cast send "$WETH_ADDRESS" \
  "mint(address,uint256)" \
  "$USER_ADDRESS" \
  "$MINT_AMOUNT" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

echo "==> Approving DSCEngine to spend WETH..."
cast send "$WETH_ADDRESS" \
  "approve(address,uint256)" \
  "$DSC_ENGINE_ADDRESS" \
  "$DEPOSIT_AMOUNT" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

echo "==> Depositing WETH collateral..."
cast send "$DSC_ENGINE_ADDRESS" \
  "depositCollateral(address,uint256)" \
  "$WETH_ADDRESS" \
  "$DEPOSIT_AMOUNT" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

echo
echo "==> Post-seed checks"
echo "--- getAccountInformation ---"
cast call "$DSC_ENGINE_ADDRESS" \
  "getAccountInformation(address)(uint256,uint256)" \
  "$USER_ADDRESS" \
  --rpc-url "$RPC_URL"

echo
echo "--- getAccountCollateralValue ---"
cast call "$DSC_ENGINE_ADDRESS" \
  "getAccountCollateralValue(address)(uint256)" \
  "$USER_ADDRESS" \
  --rpc-url "$RPC_URL"

echo
echo "--- getHealthFactor ---"
cast call "$DSC_ENGINE_ADDRESS" \
  "getHealthFactor(address)(uint256)" \
  "$USER_ADDRESS" \
  --rpc-url "$RPC_URL"

echo
echo "--- WETH wallet balance ---"
cast call "$WETH_ADDRESS" \
  "balanceOf(address)(uint256)" \
  "$USER_ADDRESS" \
  --rpc-url "$RPC_URL"

echo
echo "==> seed-local-state done."
