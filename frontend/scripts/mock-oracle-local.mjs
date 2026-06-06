import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseAbi,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rpcUrl = process.env.ANVIL_RPC_URL ?? "http://127.0.0.1:8545";
const privateKey =
  process.env.ORACLE_UPDATER_PRIVATE_KEY ??
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const constantsPath = resolve(import.meta.dirname, "../src/constants/contracts.ts");

function readAddress(key) {
  const content = readFileSync(constantsPath, "utf8");
  const match = content.match(new RegExp(`${key}: "(0x[a-fA-F0-9]{40})"`));
  if (!match) throw new Error(`Unable to read ${key} from ${constantsPath}`);
  return match[1];
}

const wethFeed = readAddress("ethUsdPriceFeed");
const wbtcFeed = readAddress("btcUsdPriceFeed");

const abi = parseAbi([
  "function latestAnswer() view returns (int256)",
  "function updateAnswer(int256 answer)",
]);
const anvil = {
  id: 31337,
  name: "Local Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
};
const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({ chain: anvil, transport: http(rpcUrl) });
const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(rpcUrl),
});

async function assertLocalAnvil() {
  if ((await publicClient.getChainId()) !== 31337) {
    throw new Error("Mock oracle updates are only available on local Anvil.");
  }
}

async function readPrice(address) {
  const answer = await publicClient.readContract({
    address,
    abi,
    functionName: "latestAnswer",
  });
  return Number(formatUnits(answer, 8)).toFixed(2);
}

async function updatePrice(address, price) {
  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new Error(`Invalid USD price: ${price}`);
  }

  const hash = await walletClient.writeContract({
    account,
    address,
    abi,
    functionName: "updateAnswer",
    args: [parseUnits(price, 8)],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

await assertLocalAnvil();

const action = process.argv[2] ?? "show";
const minimumDemoPrice = 1;
const stepDown = async (address) =>
  Math.max(Number(await readPrice(address)) * 0.75, minimumDemoPrice).toFixed(
    2,
  );
const presets = {
  recover: { wethUsd: "2000", wbtcUsd: "45000" },
  update: {
    wethUsd: process.env.WETH_PRICE ?? "",
    wbtcUsd: process.env.WBTC_PRICE ?? "",
  },
};

if (action === "drop") {
  await updatePrice(wethFeed, await stepDown(wethFeed));
  await updatePrice(wbtcFeed, await stepDown(wbtcFeed));
} else if (action in presets) {
  await updatePrice(wethFeed, presets[action].wethUsd);
  await updatePrice(wbtcFeed, presets[action].wbtcUsd);
} else if (action !== "show") {
  throw new Error(`Unknown action: ${action}`);
}

console.log("Local Mock Price Oracle");
console.log(`WETH / USD: $${await readPrice(wethFeed)}`);
console.log(`WBTC / USD: $${await readPrice(wbtcFeed)}`);
