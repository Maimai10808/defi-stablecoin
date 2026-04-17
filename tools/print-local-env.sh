#!/usr/bin/env bash
set -euo pipefail

ADDRESSES_FILE="./web/lib/contracts/addresses/31337.json"

echo 'export RPC_URL=http://127.0.0.1:8545'
echo 'export CHAIN_ID=31337'
echo "export DSC_ENGINE=$(jq -r '.dscEngine' "$ADDRESSES_FILE")"
echo "export DSC=$(jq -r '.dsc' "$ADDRESSES_FILE")"
echo "export WETH=$(jq -r '.weth' "$ADDRESSES_FILE")"
echo "export WBTC=$(jq -r '.wbtc' "$ADDRESSES_FILE")"
echo "export ETH_USD_FEED=$(jq -r '.ethUsdPriceFeed' "$ADDRESSES_FILE")"
echo "export BTC_USD_FEED=$(jq -r '.btcUsdPriceFeed' "$ADDRESSES_FILE")"

echo 'export TARGET=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
echo 'export TARGET_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

echo 'export LIQUIDATOR=0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
echo 'export LIQUIDATOR_PK=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
