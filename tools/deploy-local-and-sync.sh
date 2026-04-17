#!/usr/bin/env bash
set -e

echo "==> Building contracts..."
forge build

echo "==> Syncing ABIs..."
./tools/sync-abi.sh

echo "==> Deploying contracts..."
forge script script/DeployDSC.s.sol:DeployDSC --rpc-url http://127.0.0.1:8545 --broadcast

echo "==> Done."
