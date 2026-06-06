# DeFi Stablecoin Demo

This repository demonstrates the lifecycle of an overcollateralized DSC
position on local Anvil:

`Deposit Collateral → Mint DSC → Monitor Health Factor → Repay / Redeem → Liquidation`

## Start the local demo

Use separate terminals:

```bash
npm run contracts:anvil
```

```bash
npm run contracts:deploy:all
npm run frontend:dev
```

Open `http://localhost:3000`, connect an Anvil wallet, and open **Protocol
Flow**.

## Local Mock Price Oracle

The local deployment uses updateable `MockV3Aggregator` feeds with 8 decimals:

- WETH starts at `$2,000`
- WBTC starts at `$45,000`

The **Local Mock Price Oracle** panel can update both feeds directly from the
demo UI. After an update, protocol reads are refreshed so collateral value,
maximum mintable DSC, Health Factor, and liquidation risk use the latest
on-chain mock prices.

While live fluctuation is enabled, the panel writes a small price movement to
the local mock feeds every eight seconds. **Simulate Price Drop** is
step-based: every click reduces both current prices by 25%, down to a `$1`
floor. The non-zero floor keeps liquidation calculations usable because a zero
oracle price would cause token-per-USD division to revert.

CLI alternatives:

```bash
npm run oracle:show:local
npm run oracle:drop:local
npm run oracle:recover:local
WETH_PRICE=1800 WBTC_PRICE=42000 npm run oracle:update:local
```

Suggested video flow:

1. Deposit WETH or WBTC.
2. Mint DSC while the Health Factor is safe.
3. Click **Simulate Price Drop**.
4. Click it repeatedly and observe collateral value and Health Factor decrease.
5. Open the Liquidation tab when the position becomes unsafe.
6. Click **Reset Prices** to restore the default feed values.

Mock oracle mutations are restricted to chain ID `31337` and a localhost Anvil
RPC endpoint. Oracle writes use a dedicated Anvil service account instead of
the demo wallet, preventing automatic price ticks from competing with user
transactions for the same nonce. The service key is only used by server-side
API routes or CLI scripts and must never use a `NEXT_PUBLIC_` environment
variable.
