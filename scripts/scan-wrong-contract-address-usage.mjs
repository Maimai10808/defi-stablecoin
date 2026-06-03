#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const TARGET_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "out",
  "coverage",
  ".git",
]);

const DSCEngineAddressNames = [
  "DSC_ENGINE_ADDRESS",
  "dscEngineAddress",
  "CONTRACT_ADDRESSES.dscEngine",
];

const dscTokenAddressNames = [
  "DECENTRALIZED_STABLE_COIN_ADDRESS",
  "decentralizedStableCoinAddress",
  "CONTRACT_ADDRESSES.decentralizedStableCoin",
];

const collateralTokenAddressNames = [
  "WETH_ADDRESS",
  "WBTC_ADDRESS",
  "wethMockAddress",
  "wbtcMockAddress",
  "CONTRACT_ADDRESSES.weth",
  "CONTRACT_ADDRESSES.wbtc",
];

const erc20HookPatterns = [
  /useReadWethMock[A-Za-z0-9_]*/g,
  /useWriteWethMock[A-Za-z0-9_]*/g,
  /useSimulateWethMock[A-Za-z0-9_]*/g,
  /useWatchWethMock[A-Za-z0-9_]*/g,

  /useReadWbtcMock[A-Za-z0-9_]*/g,
  /useWriteWbtcMock[A-Za-z0-9_]*/g,
  /useSimulateWbtcMock[A-Za-z0-9_]*/g,
  /useWatchWbtcMock[A-Za-z0-9_]*/g,

  /useReadDecentralizedStableCoin[A-Za-z0-9_]*/g,
  /useWriteDecentralizedStableCoin[A-Za-z0-9_]*/g,
  /useSimulateDecentralizedStableCoin[A-Za-z0-9_]*/g,
  /useWatchDecentralizedStableCoin[A-Za-z0-9_]*/g,
];

const dscEngineHookPatterns = [
  /useReadDscEngine[A-Za-z0-9_]*/g,
  /useWriteDscEngine[A-Za-z0-9_]*/g,
  /useSimulateDscEngine[A-Za-z0-9_]*/g,
  /useWatchDscEngine[A-Za-z0-9_]*/g,
];

const suspiciousPatterns = [
  {
    type: "error",
    title: "ERC20 tokenAddress is using DSCEngine address",
    regex:
      /tokenAddress\s*:\s*(DSC_ENGINE_ADDRESS|dscEngineAddress|CONTRACT_ADDRESSES\.dscEngine)/g,
    hint: "ERC20 tokenAddress should use WETH_ADDRESS, WBTC_ADDRESS, or DECENTRALIZED_STABLE_COIN_ADDRESS, not DSCEngine.",
  },
  {
    type: "error",
    title: "ERC20 approval target may be wrong",
    regex:
      /approve[A-Za-z0-9_]*\([^)]*(WETH_ADDRESS|WBTC_ADDRESS|wethMockAddress|wbtcMockAddress)[^)]*\)/g,
    hint: "Token approve should usually call token.approve(spender, amount). The token address is the contract target, and DSCEngine should be the spender.",
  },
  {
    type: "warning",
    title: "Raw DSCEngine address used inside token object",
    regex:
      /(symbol\s*:\s*["']WETH["'][\s\S]{0,500}DSC_ENGINE_ADDRESS|symbol\s*:\s*["']WBTC["'][\s\S]{0,500}DSC_ENGINE_ADDRESS)/g,
    hint: "A collateral token object contains DSC_ENGINE_ADDRESS nearby. Confirm it is allowance spender only, not tokenAddress.",
  },
  {
    type: "warning",
    title: "Hardcoded local Anvil address detected",
    regex: /0x[a-fA-F0-9]{40}/g,
    hint: "Prefer importing addresses from src/constants/contracts.ts unless this is generated code or ABI output.",
  },
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        files.push(...walk(fullPath));
      }
      continue;
    }

    if (entry.isFile() && TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function getLineInfo(content, index) {
  const before = content.slice(0, index);
  const line = before.split("\n").length;
  const lineStart = content.lastIndexOf("\n", index) + 1;
  const lineEnd = content.indexOf("\n", index);
  const text = content.slice(
    lineStart,
    lineEnd === -1 ? content.length : lineEnd,
  );

  return {
    line,
    text: text.trim(),
  };
}

function uniqueMatches(content, regex) {
  const matches = [];
  regex.lastIndex = 0;

  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      value: match[0],
      index: match.index,
    });

    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }

  return matches;
}

function hasAny(content, names) {
  return names.some((name) => content.includes(name));
}

function findHookNames(content, patterns) {
  const names = new Set();

  for (const pattern of patterns) {
    const matches = uniqueMatches(content, pattern);
    for (const match of matches) {
      names.add(match.value);
    }
  }

  return [...names].sort();
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(ROOT, filePath);

  const errors = [];
  const warnings = [];
  const info = [];

  for (const rule of suspiciousPatterns) {
    const matches = uniqueMatches(content, rule.regex);

    for (const match of matches) {
      const { line, text } = getLineInfo(content, match.index);

      const result = {
        file: relativePath,
        line,
        title: rule.title,
        text,
        hint: rule.hint,
      };

      if (rule.type === "error") {
        errors.push(result);
      } else {
        warnings.push(result);
      }
    }
  }

  const erc20Hooks = findHookNames(content, erc20HookPatterns);
  const dscEngineHooks = findHookNames(content, dscEngineHookPatterns);

  const usesDscEngineAddress = hasAny(content, DSCEngineAddressNames);
  const usesDscTokenAddress = hasAny(content, dscTokenAddressNames);
  const usesCollateralAddress = hasAny(content, collateralTokenAddressNames);

  if (erc20Hooks.length > 0) {
    info.push({
      file: relativePath,
      title: "ERC20 hooks detected",
      detail: erc20Hooks.join(", "),
    });

    if (usesDscEngineAddress && !relativePath.includes("generated/wagmi.ts")) {
      warnings.push({
        file: relativePath,
        line: 1,
        title: "ERC20 hook file also imports or references DSCEngine address",
        text: erc20Hooks.join(", "),
        hint: "This is valid only when DSCEngine is used as spender for allowance or approve. Confirm it is not used as ERC20 contract address.",
      });
    }
  }

  if (dscEngineHooks.length > 0) {
    info.push({
      file: relativePath,
      title: "DSCEngine hooks detected",
      detail: dscEngineHooks.join(", "),
    });
  }

  if (
    relativePath.endsWith("src/generated/wagmi.ts") ||
    relativePath.endsWith("src/generated/wagmi.tsx")
  ) {
    checkGeneratedWagmi(content, relativePath, errors, warnings);
  }

  if (usesDscTokenAddress || usesCollateralAddress || usesDscEngineAddress) {
    info.push({
      file: relativePath,
      title: "Contract address constants detected",
      detail: [
        usesDscEngineAddress ? "DSCEngine" : null,
        usesDscTokenAddress ? "DSC token" : null,
        usesCollateralAddress ? "Collateral token" : null,
      ]
        .filter(Boolean)
        .join(", "),
    });
  }

  return { errors, warnings, info };
}

function checkGeneratedWagmi(content, relativePath, errors, warnings) {
  const requiredPairs = [
    {
      name: "DSCEngine",
      config: "dscEngineConfig",
      expectedAddress: "dscEngineAddress",
    },
    {
      name: "DecentralizedStableCoin",
      config: "decentralizedStableCoinConfig",
      expectedAddress: "decentralizedStableCoinAddress",
    },
    {
      name: "WETH Mock",
      config: "wethMockConfig",
      expectedAddress: "wethMockAddress",
    },
    {
      name: "WBTC Mock",
      config: "wbtcMockConfig",
      expectedAddress: "wbtcMockAddress",
    },
  ];

  for (const item of requiredPairs) {
    const configRegex = new RegExp(
      `export const ${item.config}\\s*=\\s*{[\\s\\S]*?address\\s*:\\s*${item.expectedAddress}`,
      "m",
    );

    if (!configRegex.test(content)) {
      errors.push({
        file: relativePath,
        line: 1,
        title: `${item.name} generated config may use wrong address`,
        text: item.config,
        hint: `${item.config} should use address: ${item.expectedAddress}. Regenerate wagmi hooks after syncing addresses.`,
      });
    }
  }

  const badWethRegex =
    /export const wethMockConfig\s*=\s*{[\s\S]*?address\s*:\s*dscEngineAddress/m;
  const badWbtcRegex =
    /export const wbtcMockConfig\s*=\s*{[\s\S]*?address\s*:\s*dscEngineAddress/m;
  const badDscRegex =
    /export const decentralizedStableCoinConfig\s*=\s*{[\s\S]*?address\s*:\s*dscEngineAddress/m;

  if (badWethRegex.test(content)) {
    errors.push({
      file: relativePath,
      line: 1,
      title: "WETH generated config is using DSCEngine address",
      text: "wethMockConfig",
      hint: "Fix wagmi.config.ts and regenerate src/generated/wagmi.ts.",
    });
  }

  if (badWbtcRegex.test(content)) {
    errors.push({
      file: relativePath,
      line: 1,
      title: "WBTC generated config is using DSCEngine address",
      text: "wbtcMockConfig",
      hint: "Fix wagmi.config.ts and regenerate src/generated/wagmi.ts.",
    });
  }

  if (badDscRegex.test(content)) {
    errors.push({
      file: relativePath,
      line: 1,
      title: "DSC token generated config is using DSCEngine address",
      text: "decentralizedStableCoinConfig",
      hint: "Fix wagmi.config.ts and regenerate src/generated/wagmi.ts.",
    });
  }

  const validGeneratedShape =
    content.includes("address: dscEngineAddress") &&
    content.includes("address: decentralizedStableCoinAddress") &&
    content.includes("address: wethMockAddress") &&
    content.includes("address: wbtcMockAddress");

  if (!validGeneratedShape) {
    warnings.push({
      file: relativePath,
      line: 1,
      title:
        "Generated wagmi file does not contain all expected address bindings",
      text: "src/generated/wagmi.ts",
      hint: "Expected DSCEngine, DecentralizedStableCoin, WETH Mock, and WBTC Mock to each bind to their own generated address object.",
    });
  }
}

function printResult(label, items, icon) {
  if (items.length === 0) return;

  console.log(`\n${icon} ${label}`);
  console.log("-".repeat(60));

  for (const item of items) {
    console.log(`${item.file}:${item.line}`);
    console.log(`  ${item.title}`);
    if (item.text) console.log(`  Code: ${item.text}`);
    if (item.detail) console.log(`  Detail: ${item.detail}`);
    if (item.hint) console.log(`  Hint: ${item.hint}`);
    console.log("");
  }
}

function main() {
  const files = walk(SRC_DIR);

  const allErrors = [];
  const allWarnings = [];
  const allInfo = [];

  for (const file of files) {
    const result = scanFile(file);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
    allInfo.push(...result.info);
  }

  console.log("\n🔍 Enhanced Contract Address Usage Scan");
  console.log("========================================");
  console.log(`Scanned files: ${files.length}`);

  printResult("Errors", allErrors, "❌");
  printResult("Warnings", allWarnings, "⚠️");
  printResult("Detected Hook / Address Usage", allInfo, "ℹ️");

  console.log("========================================");
  console.log(`Errors found: ${allErrors.length}`);
  console.log(`Warnings found: ${allWarnings.length}`);
  console.log("========================================");

  if (allErrors.length > 0) {
    console.log("\n❌ Suspicious contract address usage found.");
    process.exit(1);
  }

  if (allWarnings.length > 0) {
    console.log("\n⚠️ No hard errors, but please review warnings above.");
    process.exit(0);
  }

  console.log("\n✅ No suspicious DSCEngine / ERC20 address usage found.");
}

main();
