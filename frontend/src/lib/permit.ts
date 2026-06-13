import {
  parseSignature,
  type Address,
  type Hex,
} from "viem";

export const PERMIT_VALIDITY_SECONDS = 20 * 60;

export const permitTypes = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

type BuildPermitTypedDataParameters = {
  tokenName: string;
  chainId: number;
  tokenAddress: Address;
  owner: Address;
  spender: Address;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
};

export function getPermitDeadline(now = Date.now()) {
  return BigInt(Math.floor(now / 1000) + PERMIT_VALIDITY_SECONDS);
}

export function buildPermitTypedData({
  tokenName,
  chainId,
  tokenAddress,
  owner,
  spender,
  value,
  nonce,
  deadline,
}: BuildPermitTypedDataParameters) {
  return {
    domain: {
      name: tokenName,
      version: "1",
      chainId,
      verifyingContract: tokenAddress,
    },
    types: permitTypes,
    primaryType: "Permit" as const,
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };
}

export function splitPermitSignature(signature: Hex) {
  const parsed = parseSignature(signature);
  const v = parsed.v ?? BigInt(parsed.yParity + 27);

  return {
    v: Number(v),
    r: parsed.r,
    s: parsed.s,
  };
}

export async function signErc20Permit(
  parameters: BuildPermitTypedDataParameters,
  signTypedData: (
    typedData: ReturnType<typeof buildPermitTypedData>,
  ) => Promise<Hex>,
) {
  const deadline = parameters.deadline;
  const signature = await signTypedData(buildPermitTypedData(parameters));

  return {
    deadline,
    ...splitPermitSignature(signature),
  };
}
