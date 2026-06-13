const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

const abiOutputDir = path.join(ROOT_DIR, "frontend", "src", "contracts", "abi");

const contracts = [
  {
    name: "DSCEngine",
    from: path.join(
      ROOT_DIR,
      "foundry",
      "out",
      "DSCEngine.sol",
      "DSCEngine.json",
    ),
    to: path.join(abiOutputDir, "DSCEngine.json"),
  },
  {
    name: "DecentralizedStableCoin",
    from: path.join(
      ROOT_DIR,
      "foundry",
      "out",
      "DecentralizedStableCoin.sol",
      "DecentralizedStableCoin.json",
    ),
    to: path.join(abiOutputDir, "DecentralizedStableCoin.json"),
  },
  {
    name: "MockERC20Permit",
    from: path.join(
      ROOT_DIR,
      "foundry",
      "out",
      "MockERC20Permit.sol",
      "MockERC20Permit.json",
    ),
    to: path.join(abiOutputDir, "MockERC20Permit.json"),
  },
];

fs.mkdirSync(abiOutputDir, { recursive: true });

for (const contract of contracts) {
  if (!fs.existsSync(contract.from)) {
    throw new Error(
      `ABI artifact not found for ${contract.name}: ${contract.from}\n` +
        `Please run: cd foundry && forge build`,
    );
  }

  fs.copyFileSync(contract.from, contract.to);
  console.log(`Copied ${contract.name} ABI to ${contract.to}`);
}

console.log("Contract ABI sync completed.");
