import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import type { Abi } from "viem";

import dscEngineArtifact from "./src/contracts/abi/DSCEngine.json";
import decentralizedStableCoinArtifact from "./src/contracts/abi/DecentralizedStableCoin.json";
import mockErc20PermitArtifact from "./src/contracts/abi/MockERC20Permit.json";

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
      abi: dscEngineArtifact.abi as Abi,
      address: {
        31337: DSC_ENGINE_ADDRESS as `0x${string}`,
      },
    },
    {
      name: "DecentralizedStableCoin",
      abi: decentralizedStableCoinArtifact.abi as Abi,
      address: {
        31337: DECENTRALIZED_STABLE_COIN_ADDRESS as `0x${string}`,
      },
    },
    {
      name: "WethMock",
      abi: mockErc20PermitArtifact.abi as Abi,
      address: {
        31337: WETH_ADDRESS as `0x${string}`,
      },
    },
    {
      name: "WbtcMock",
      abi: mockErc20PermitArtifact.abi as Abi,
      address: {
        31337: WBTC_ADDRESS as `0x${string}`,
      },
    },
  ],
  plugins: [react()],
});
