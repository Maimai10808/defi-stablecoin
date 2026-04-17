#!/usr/bin/env bash
set -e

echo "==> Syncing ABIs..."

jq '.abi' out/DSCEngine.sol/DSCEngine.json > web/lib/contracts/abi/DSCEngine.abi.json
jq '.abi' out/DecentralizedStableCoin.sol/DecentralizedStableCoin.json > web/lib/contracts/abi/DecentralizedStableCoin.abi.json
jq '.abi' out/ERC20Mock.sol/ERC20Mock.json > web/lib/contracts/abi/ERC20Mock.abi.json

echo "==> ABI sync completed."
