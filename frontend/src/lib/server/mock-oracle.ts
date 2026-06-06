import "server-only";

import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseAbi,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  BTC_USD_PRICE_FEED_ADDRESS,
  CHAIN_ID,
  ETH_USD_PRICE_FEED_ADDRESS,
} from "@/constants/contracts";

const LOCAL_CHAIN_ID = 31337;
const DEFAULT_ANVIL_RPC_URL = "http://127.0.0.1:8545";
// Anvil account #1 is reserved for server-side oracle updates. The seeded demo
// wallet uses account #0, so user transactions and oracle ticks never compete
// for the same nonce.
const DEFAULT_ORACLE_UPDATER_PRIVATE_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const MIN_DEMO_PRICE_USD = 1;
const STEP_DROP_RATIO = 0.75;
const MAX_TICK_CHANGE_RATIO = 0.01;

const mockPriceFeedAbi = parseAbi([
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function updateAnswer(int256 answer)",
]);

const localAnvil = {
  id: LOCAL_CHAIN_ID,
  name: "Local Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [DEFAULT_ANVIL_RPC_URL] } },
} as const;

export type MockOraclePrices = {
  wethUsd: string;
  wbtcUsd: string;
  source: "Local Mock Price Oracle";
  updatedAt: number;
};

declare global {
  var mockOracleWriteQueue: Promise<void> | undefined;
}

function queueOracleWrite<T>(operation: () => Promise<T>) {
  const previous = globalThis.mockOracleWriteQueue ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);

  globalThis.mockOracleWriteQueue = current.then(
    () => undefined,
    () => undefined,
  );

  return current;
}

function getRpcUrl() {
  return process.env.ANVIL_RPC_URL ?? DEFAULT_ANVIL_RPC_URL;
}

function assertLocalConfiguration() {
  const rpcUrl = getRpcUrl();
  const isLocalRpc =
    rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost");

  if (CHAIN_ID !== LOCAL_CHAIN_ID || !isLocalRpc) {
    throw new Error("Mock oracle updates are only available on local Anvil.");
  }
}

function createClients() {
  assertLocalConfiguration();

  const transport = http(getRpcUrl());
  const publicClient = createPublicClient({ chain: localAnvil, transport });
  const privateKey = (process.env.ORACLE_UPDATER_PRIVATE_KEY ??
    DEFAULT_ORACLE_UPDATER_PRIVATE_KEY) as Hex;
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: localAnvil,
    transport,
  });

  return { publicClient, walletClient, account };
}

async function assertLocalChain() {
  const { publicClient } = createClients();
  const chainId = await publicClient.getChainId();

  if (chainId !== LOCAL_CHAIN_ID) {
    throw new Error("Mock oracle updates are only available on local Anvil.");
  }
}

async function readPrice(address: Address) {
  const { publicClient } = createClients();
  const [, answer, , updatedAt] = await publicClient.readContract({
    address,
    abi: mockPriceFeedAbi,
    functionName: "latestRoundData",
  });

  return {
    price: Number(formatUnits(answer, 8)).toFixed(2),
    updatedAt: Number(updatedAt),
  };
}

export async function getMockOraclePrices(): Promise<MockOraclePrices> {
  await assertLocalChain();
  const [weth, wbtc] = await Promise.all([
    readPrice(ETH_USD_PRICE_FEED_ADDRESS),
    readPrice(BTC_USD_PRICE_FEED_ADDRESS),
  ]);

  return {
    wethUsd: weth.price,
    wbtcUsd: wbtc.price,
    source: "Local Mock Price Oracle",
    updatedAt: Math.max(weth.updatedAt, wbtc.updatedAt),
  };
}

async function updatePrice(address: Address, price: string) {
  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new Error("Oracle prices must be positive numbers.");
  }

  const { publicClient, walletClient, account } = createClients();
  const hash = await walletClient.writeContract({
    account,
    address,
    abi: mockPriceFeedAbi,
    functionName: "updateAnswer",
    args: [parseUnits(price, 8)],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

async function updateMockOraclePricesDirect(input: {
  wethUsd: string;
  wbtcUsd: string;
}) {
  await assertLocalChain();
  await updatePrice(ETH_USD_PRICE_FEED_ADDRESS, input.wethUsd);
  await updatePrice(BTC_USD_PRICE_FEED_ADDRESS, input.wbtcUsd);
  return getMockOraclePrices();
}

export function updateMockOraclePrices(input: {
  wethUsd: string;
  wbtcUsd: string;
}) {
  return queueOracleWrite(() => updateMockOraclePricesDirect(input));
}

function nextStepDown(price: string) {
  return Math.max(Number(price) * STEP_DROP_RATIO, MIN_DEMO_PRICE_USD).toFixed(
    2,
  );
}

function nextFluctuatingPrice(price: string) {
  const changeRatio =
    (Math.random() * 2 - 1) * MAX_TICK_CHANGE_RATIO;

  return Math.max(
    Number(price) * (1 + changeRatio),
    MIN_DEMO_PRICE_USD,
  ).toFixed(2);
}

export function stepDownMockOraclePrices() {
  return queueOracleWrite(async () => {
    const current = await getMockOraclePrices();

    return updateMockOraclePricesDirect({
      wethUsd: nextStepDown(current.wethUsd),
      wbtcUsd: nextStepDown(current.wbtcUsd),
    });
  });
}

export function tickMockOraclePrices() {
  return queueOracleWrite(async () => {
    const current = await getMockOraclePrices();

    return updateMockOraclePricesDirect({
      wethUsd: nextFluctuatingPrice(current.wethUsd),
      wbtcUsd: nextFluctuatingPrice(current.wbtcUsd),
    });
  });
}
