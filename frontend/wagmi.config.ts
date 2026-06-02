import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi } from "viem";

import dscEngineAbi from "./src/contracts/abi/DSCEngine.json";
import decentralizedStableCoinAbi from "./src/contracts/abi/DecentralizedStableCoin.json";
import erc20MockAbi from "./src/contracts/abi/ERC20Mock.json";

import {
  DSC_ENGINE_ADDRESS,
  DECENTRALIZED_STABLE_COIN_ADDRESS,
  WETH_ADDRESS,
  WBTC_ADDRESS,
} from "./src/constants/contracts";

export default defineConfig({
  out: "src/generated/wagmi.ts",
  contracts: [
    {
      name: "DSCEngine",
      abi: dscEngineAbi as Abi,
      address: {
        // Local Anvil
        31337: DSC_ENGINE_ADDRESS as `0x${string}`,
      },
    },
    {
      name: "DecentralizedStableCoin",
      abi: decentralizedStableCoinAbi as Abi,
      address: {
        // Local Anvil
        31337: DECENTRALIZED_STABLE_COIN_ADDRESS as `0x${string}`,
      },
    },
    {
      name: "WethMock",
      abi: erc20MockAbi as Abi,
      address: {
        // Local Anvil
        31337: WETH_ADDRESS as `0x${string}`,
      },
    },
    {
      name: "WbtcMock",
      abi: erc20MockAbi as Abi,
      address: {
        // Local Anvil
        31337: WBTC_ADDRESS as `0x${string}`,
      },
    },
  ],
  plugins: [react()],
});
