import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DSCEngine
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const dscEngineAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'collateralTokens',
        internalType: 'address[]',
        type: 'address[]',
      },
      {
        name: 'priceFeedAddresses',
        internalType: 'address[]',
        type: 'address[]',
      },
      { name: 'dscAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dscAmountToBurn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnDsc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'dscAmountToMint', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'depositCollateralAndMintDsc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dsc',
    outputs: [{ name: 'dscAddress', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getAccountCollateralValue',
    outputs: [
      {
        name: 'totalCollateralValueInUsd',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getAccountInformation',
    outputs: [
      { name: 'totalDscMinted', internalType: 'uint256', type: 'uint256' },
      {
        name: 'collateralValueInUsd',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'collateralToken', internalType: 'address', type: 'address' },
    ],
    name: 'getCollateralBalanceOfUser',
    outputs: [
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getDscMintedAmount',
    outputs: [{ name: 'dscMinted', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getHealthFactor',
    outputs: [
      { name: 'healthFactor', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinHealthFactor',
    outputs: [
      { name: 'minimumHealthFactor', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'usdAmountInWei', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getTokenAmountFromUsd',
    outputs: [
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'getTokenCollateralAddrList',
    outputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUsdValue',
    outputs: [{ name: 'usdValue', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'userToLiquidate', internalType: 'address', type: 'address' },
      { name: 'debtToCover', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'liquidate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dscAmountToMint', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mintDsc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
    ],
    name: 'priceFeeds',
    outputs: [{ name: 'priceFeed', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'redeemCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'collateralToken', internalType: 'address', type: 'address' },
      { name: 'collateralAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'dscAmountToBurn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'redeemCollateralForDsc',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'collateralToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'collateralAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CollateralDeposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'collateralToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'collateralAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CollateralRedeemed',
  },
  { type: 'error', inputs: [], name: 'DSCEngine_TransferFromFailed' },
  { type: 'error', inputs: [], name: 'DSCEngine__AmountMustBeMoreThanZero' },
  {
    type: 'error',
    inputs: [
      { name: 'userHealthFactor', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'DSCEngine__HealthFactorIsBroken',
  },
  {
    type: 'error',
    inputs: [
      { name: 'userHealthFactor', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'DSCEngine__HealthFactorIsSafe',
  },
  { type: 'error', inputs: [], name: 'DSCEngine__HealthFactorNotImproved' },
  { type: 'error', inputs: [], name: 'DSCEngine__MintFailed' },
  { type: 'error', inputs: [], name: 'DSCEngine__NotTheAllowedToken' },
  {
    type: 'error',
    inputs: [],
    name: 'DSCEngine__TheAddressListLengthNotMatch',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

/**
 *
 */
export const dscEngineAddress = {
  31337: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
} as const

/**
 *
 */
export const dscEngineConfig = {
  address: dscEngineAddress,
  abi: dscEngineAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DecentralizedStableCoin
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const decentralizedStableCoinAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dscAmountToBurn', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'dscAmountToMint', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [],
    name: 'DecentralizedStableCoin__AmountMustBeMoreThanZero',
  },
  {
    type: 'error',
    inputs: [],
    name: 'DecentralizedStableCoin__BurnAmountExceedsBalance',
  },
  {
    type: 'error',
    inputs: [],
    name: 'DecentralizedStableCoin__NotZeroAddress',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const

/**
 *
 */
export const decentralizedStableCoinAddress = {
  31337: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
} as const

/**
 *
 */
export const decentralizedStableCoinConfig = {
  address: decentralizedStableCoinAddress,
  abi: decentralizedStableCoinAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WbtcMock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const wbtcMockAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
] as const

/**
 *
 */
export const wbtcMockAddress = {
  31337: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
} as const

/**
 *
 */
export const wbtcMockConfig = {
  address: wbtcMockAddress,
  abi: wbtcMockAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// WethMock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const wethMockAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
] as const

/**
 *
 */
export const wethMockAddress = {
  31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
} as const

/**
 *
 */
export const wethMockConfig = {
  address: wethMockAddress,
  abi: wethMockAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__
 *
 *
 */
export const useReadDscEngine = /*#__PURE__*/ createUseReadContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"dsc"`
 *
 *
 */
export const useReadDscEngineDsc = /*#__PURE__*/ createUseReadContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
  functionName: 'dsc',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getAccountCollateralValue"`
 *
 *
 */
export const useReadDscEngineGetAccountCollateralValue =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getAccountCollateralValue',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getAccountInformation"`
 *
 *
 */
export const useReadDscEngineGetAccountInformation =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getAccountInformation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getCollateralBalanceOfUser"`
 *
 *
 */
export const useReadDscEngineGetCollateralBalanceOfUser =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getCollateralBalanceOfUser',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getDscMintedAmount"`
 *
 *
 */
export const useReadDscEngineGetDscMintedAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getDscMintedAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getHealthFactor"`
 *
 *
 */
export const useReadDscEngineGetHealthFactor =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getHealthFactor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getMinHealthFactor"`
 *
 *
 */
export const useReadDscEngineGetMinHealthFactor =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getMinHealthFactor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getTokenAmountFromUsd"`
 *
 *
 */
export const useReadDscEngineGetTokenAmountFromUsd =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getTokenAmountFromUsd',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getTokenCollateralAddrList"`
 *
 *
 */
export const useReadDscEngineGetTokenCollateralAddrList =
  /*#__PURE__*/ createUseReadContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'getTokenCollateralAddrList',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"getUsdValue"`
 *
 *
 */
export const useReadDscEngineGetUsdValue = /*#__PURE__*/ createUseReadContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
  functionName: 'getUsdValue',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"priceFeeds"`
 *
 *
 */
export const useReadDscEnginePriceFeeds = /*#__PURE__*/ createUseReadContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
  functionName: 'priceFeeds',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__
 *
 *
 */
export const useWriteDscEngine = /*#__PURE__*/ createUseWriteContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"burnDsc"`
 *
 *
 */
export const useWriteDscEngineBurnDsc = /*#__PURE__*/ createUseWriteContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
  functionName: 'burnDsc',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"depositCollateral"`
 *
 *
 */
export const useWriteDscEngineDepositCollateral =
  /*#__PURE__*/ createUseWriteContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'depositCollateral',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"depositCollateralAndMintDsc"`
 *
 *
 */
export const useWriteDscEngineDepositCollateralAndMintDsc =
  /*#__PURE__*/ createUseWriteContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'depositCollateralAndMintDsc',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"liquidate"`
 *
 *
 */
export const useWriteDscEngineLiquidate = /*#__PURE__*/ createUseWriteContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
  functionName: 'liquidate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"mintDsc"`
 *
 *
 */
export const useWriteDscEngineMintDsc = /*#__PURE__*/ createUseWriteContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
  functionName: 'mintDsc',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"redeemCollateral"`
 *
 *
 */
export const useWriteDscEngineRedeemCollateral =
  /*#__PURE__*/ createUseWriteContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'redeemCollateral',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"redeemCollateralForDsc"`
 *
 *
 */
export const useWriteDscEngineRedeemCollateralForDsc =
  /*#__PURE__*/ createUseWriteContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'redeemCollateralForDsc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__
 *
 *
 */
export const useSimulateDscEngine = /*#__PURE__*/ createUseSimulateContract({
  abi: dscEngineAbi,
  address: dscEngineAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"burnDsc"`
 *
 *
 */
export const useSimulateDscEngineBurnDsc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'burnDsc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"depositCollateral"`
 *
 *
 */
export const useSimulateDscEngineDepositCollateral =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'depositCollateral',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"depositCollateralAndMintDsc"`
 *
 *
 */
export const useSimulateDscEngineDepositCollateralAndMintDsc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'depositCollateralAndMintDsc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"liquidate"`
 *
 *
 */
export const useSimulateDscEngineLiquidate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'liquidate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"mintDsc"`
 *
 *
 */
export const useSimulateDscEngineMintDsc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'mintDsc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"redeemCollateral"`
 *
 *
 */
export const useSimulateDscEngineRedeemCollateral =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'redeemCollateral',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dscEngineAbi}__ and `functionName` set to `"redeemCollateralForDsc"`
 *
 *
 */
export const useSimulateDscEngineRedeemCollateralForDsc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    functionName: 'redeemCollateralForDsc',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dscEngineAbi}__
 *
 *
 */
export const useWatchDscEngineEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: dscEngineAbi, address: dscEngineAddress },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dscEngineAbi}__ and `eventName` set to `"CollateralDeposited"`
 *
 *
 */
export const useWatchDscEngineCollateralDepositedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    eventName: 'CollateralDeposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dscEngineAbi}__ and `eventName` set to `"CollateralRedeemed"`
 *
 *
 */
export const useWatchDscEngineCollateralRedeemedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dscEngineAbi,
    address: dscEngineAddress,
    eventName: 'CollateralRedeemed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__
 *
 *
 */
export const useReadDecentralizedStableCoin =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"allowance"`
 *
 *
 */
export const useReadDecentralizedStableCoinAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"balanceOf"`
 *
 *
 */
export const useReadDecentralizedStableCoinBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"decimals"`
 *
 *
 */
export const useReadDecentralizedStableCoinDecimals =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'decimals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"name"`
 *
 *
 */
export const useReadDecentralizedStableCoinName =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'name',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"owner"`
 *
 *
 */
export const useReadDecentralizedStableCoinOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"symbol"`
 *
 *
 */
export const useReadDecentralizedStableCoinSymbol =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'symbol',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"totalSupply"`
 *
 *
 */
export const useReadDecentralizedStableCoinTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__
 *
 *
 */
export const useWriteDecentralizedStableCoin =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useWriteDecentralizedStableCoinApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"burn"`
 *
 *
 */
export const useWriteDecentralizedStableCoinBurn =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"burnFrom"`
 *
 *
 */
export const useWriteDecentralizedStableCoinBurnFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"mint"`
 *
 *
 */
export const useWriteDecentralizedStableCoinMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 *
 */
export const useWriteDecentralizedStableCoinRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useWriteDecentralizedStableCoinTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useWriteDecentralizedStableCoinTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"transferOwnership"`
 *
 *
 */
export const useWriteDecentralizedStableCoinTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__
 *
 *
 */
export const useSimulateDecentralizedStableCoin =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"burn"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"burnFrom"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinBurnFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"mint"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `functionName` set to `"transferOwnership"`
 *
 *
 */
export const useSimulateDecentralizedStableCoinTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link decentralizedStableCoinAbi}__
 *
 *
 */
export const useWatchDecentralizedStableCoinEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `eventName` set to `"Approval"`
 *
 *
 */
export const useWatchDecentralizedStableCoinApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 *
 */
export const useWatchDecentralizedStableCoinOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link decentralizedStableCoinAbi}__ and `eventName` set to `"Transfer"`
 *
 *
 */
export const useWatchDecentralizedStableCoinTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: decentralizedStableCoinAbi,
    address: decentralizedStableCoinAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__
 *
 *
 */
export const useReadWbtcMock = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"allowance"`
 *
 *
 */
export const useReadWbtcMockAllowance = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"balanceOf"`
 *
 *
 */
export const useReadWbtcMockBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"decimals"`
 *
 *
 */
export const useReadWbtcMockDecimals = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"name"`
 *
 *
 */
export const useReadWbtcMockName = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"symbol"`
 *
 *
 */
export const useReadWbtcMockSymbol = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"totalSupply"`
 *
 *
 */
export const useReadWbtcMockTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wbtcMockAbi}__
 *
 *
 */
export const useWriteWbtcMock = /*#__PURE__*/ createUseWriteContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useWriteWbtcMockApprove = /*#__PURE__*/ createUseWriteContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"burn"`
 *
 *
 */
export const useWriteWbtcMockBurn = /*#__PURE__*/ createUseWriteContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"mint"`
 *
 *
 */
export const useWriteWbtcMockMint = /*#__PURE__*/ createUseWriteContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useWriteWbtcMockTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useWriteWbtcMockTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: wbtcMockAbi,
    address: wbtcMockAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wbtcMockAbi}__
 *
 *
 */
export const useSimulateWbtcMock = /*#__PURE__*/ createUseSimulateContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useSimulateWbtcMockApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wbtcMockAbi,
    address: wbtcMockAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"burn"`
 *
 *
 */
export const useSimulateWbtcMockBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"mint"`
 *
 *
 */
export const useSimulateWbtcMockMint = /*#__PURE__*/ createUseSimulateContract({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useSimulateWbtcMockTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wbtcMockAbi,
    address: wbtcMockAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wbtcMockAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useSimulateWbtcMockTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wbtcMockAbi,
    address: wbtcMockAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wbtcMockAbi}__
 *
 *
 */
export const useWatchWbtcMockEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: wbtcMockAbi,
  address: wbtcMockAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wbtcMockAbi}__ and `eventName` set to `"Approval"`
 *
 *
 */
export const useWatchWbtcMockApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wbtcMockAbi,
    address: wbtcMockAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wbtcMockAbi}__ and `eventName` set to `"Transfer"`
 *
 *
 */
export const useWatchWbtcMockTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wbtcMockAbi,
    address: wbtcMockAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__
 *
 *
 */
export const useReadWethMock = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"allowance"`
 *
 *
 */
export const useReadWethMockAllowance = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"balanceOf"`
 *
 *
 */
export const useReadWethMockBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"decimals"`
 *
 *
 */
export const useReadWethMockDecimals = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"name"`
 *
 *
 */
export const useReadWethMockName = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"symbol"`
 *
 *
 */
export const useReadWethMockSymbol = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"totalSupply"`
 *
 *
 */
export const useReadWethMockTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethMockAbi}__
 *
 *
 */
export const useWriteWethMock = /*#__PURE__*/ createUseWriteContract({
  abi: wethMockAbi,
  address: wethMockAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useWriteWethMockApprove = /*#__PURE__*/ createUseWriteContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"burn"`
 *
 *
 */
export const useWriteWethMockBurn = /*#__PURE__*/ createUseWriteContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"mint"`
 *
 *
 */
export const useWriteWethMockMint = /*#__PURE__*/ createUseWriteContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useWriteWethMockTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useWriteWethMockTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: wethMockAbi,
    address: wethMockAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethMockAbi}__
 *
 *
 */
export const useSimulateWethMock = /*#__PURE__*/ createUseSimulateContract({
  abi: wethMockAbi,
  address: wethMockAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"approve"`
 *
 *
 */
export const useSimulateWethMockApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wethMockAbi,
    address: wethMockAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"burn"`
 *
 *
 */
export const useSimulateWethMockBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"mint"`
 *
 *
 */
export const useSimulateWethMockMint = /*#__PURE__*/ createUseSimulateContract({
  abi: wethMockAbi,
  address: wethMockAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"transfer"`
 *
 *
 */
export const useSimulateWethMockTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wethMockAbi,
    address: wethMockAddress,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link wethMockAbi}__ and `functionName` set to `"transferFrom"`
 *
 *
 */
export const useSimulateWethMockTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: wethMockAbi,
    address: wethMockAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wethMockAbi}__
 *
 *
 */
export const useWatchWethMockEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: wethMockAbi,
  address: wethMockAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wethMockAbi}__ and `eventName` set to `"Approval"`
 *
 *
 */
export const useWatchWethMockApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wethMockAbi,
    address: wethMockAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link wethMockAbi}__ and `eventName` set to `"Transfer"`
 *
 *
 */
export const useWatchWethMockTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: wethMockAbi,
    address: wethMockAddress,
    eventName: 'Transfer',
  })
