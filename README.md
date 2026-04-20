# DSCoin

一个面向学习、联调和演示场景的超额抵押稳定币协议 Demo。用户可以存入 `WETH` 或 `WBTC` 作为抵押物，按价格喂价换算出的美元价值铸造稳定币 `DSC`，并通过健康因子约束仓位风险；当仓位跌破安全线时，协议允许第三方执行清算。

DSCoin 的目标不是做一个“只会跑单个合约函数”的 Solidity 示例，而是把一条完整链路串起来：`deposit collateral -> mint DSC -> burn -> redeem -> liquidation`。仓库同时包含 Foundry 合约工程、部署与同步脚本，以及一个基于 Next.js 的前端演示面板，适合合约开发者、Web3 前端开发者、面试项目准备者和刚接触 DeFi 协议的新手开发者。

## 项目定位

一句话介绍：

> DSCoin 是一个带前端演示面板的超额抵押稳定币协议 Demo，重点展示协议闭环、价格喂价、健康因子风控和前后端联调。

它主要解决三个问题：

- 帮你快速理解“超额抵押稳定币协议”最核心的业务闭环。
- 提供一个可以本地启动、部署、同步 ABI/地址并直接演示的完整工程。
- 给 Solidity + Foundry + Next.js 联调提供一个结构清晰的示例仓库。

适合的读者：

- 想系统学习稳定币协议和健康因子逻辑的开发者
- 想练习 Foundry 部署、测试和脚本能力的合约开发者
- 想把前端直接接到本地链或 Sepolia 的 Web3 前端开发者
- 需要一个可讲、可演示、可扩展项目的求职者

## 核心流程

DSCoin 当前的协议主流程是：

1. 用户向 `DSCEngine` 存入 `WETH` 或 `WBTC`。
2. 协议通过 Chainlink 价格喂价计算抵押物的美元价值。
3. 用户在健康因子允许的前提下铸造 `DSC`。
4. 用户可以销毁 `DSC` 来减少债务，也可以赎回抵押物。
5. 如果价格波动导致仓位不安全，第三方可以发起清算。

这条链路在当前仓库中不只是合约层存在，前端也提供了对应的演示入口。

## 项目特性

- 完整协议闭环：支持 `deposit / mint / burn / redeem / liquidation`
- 双抵押资产：当前支持 `WETH` 和 `WBTC`
- 健康因子风控：铸造、赎回和清算都围绕 `health factor` 进行约束
- 价格喂价接入：本地链使用 `MockV3Aggregator`，Sepolia 使用真实 Chainlink Feed
- 本地部署后自动写入前端地址：部署脚本会把最新地址同步到 `web/lib/contracts/addresses`
- ABI 半自动同步：`tools/sync-abi.sh` 会把 Foundry 编译产物里的 ABI 复制到前端
- 本地演示数据自动注入：`tools/seed-local-state.sh` 会为默认账户 mint mock token 并预存抵押物
- 前后端联调路径清晰：根目录负责合约与脚本，`web/` 负责读取链上状态和发起交易

## 技术栈

### 合约侧

- `Solidity`：实现 `DecentralizedStableCoin` 与 `DSCEngine`
- `Foundry`：负责构建、测试、脚本执行和本地部署
- `OpenZeppelin`：提供 `ERC20`、`Ownable`、`ReentrancyGuard` 等基础能力
- `Chainlink AggregatorV3Interface`：用于读取价格喂价

### 前端侧

- `Next.js 16`：承载前端页面和应用结构
- `React 19`：构建交互式协议面板
- `TypeScript`：约束 hooks、合约配置和前端数据结构
- `wagmi`：负责读写合约和钱包连接
- `viem`：负责 ABI 类型、单位处理和链上交互底层
- `RainbowKit`：提供钱包连接 UI
- `Tailwind CSS v4`：负责页面样式

### 工程化与联调

- `forge script`：负责部署合约并生成最新地址
- `cast`：在本地 seed 流程中 mint token、approve 和 deposit
- `jq`：从地址 JSON 中提取字段，供 shell 脚本继续使用
- `tools/*.sh`：把“编译 -> 部署 -> ABI 同步 -> 演示数据注入 -> 生成本地环境变量”串起来

## 仓库结构

这个仓库没有单独的 `foundry/` 子目录。当前真实结构是“Foundry 工程在根目录，前端在 `web/` 子目录”。

```text
.
├── src/                         # 核心合约
├── script/                      # Foundry 部署脚本与网络配置
├── test/                        # 单元测试、模糊测试、不变量测试
├── tools/                       # 本地开发、部署、同步、seed 脚本
├── web/                         # Next.js 前端
├── out/                         # Foundry 编译产物（ABI 来源）
├── broadcast/                   # forge script 广播记录
├── docs/                        # 项目说明文档
├── foundry.toml                 # Foundry 配置
└── README.md                    # 当前文档
```

重点目录说明：

- [`src/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/src)
  - [`DSCEngine.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/src/DSCEngine.sol)：协议核心逻辑，负责抵押、铸造、销毁、赎回和清算
  - [`DecentralizedStableCoin.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/src/DecentralizedStableCoin.sol)：稳定币本体
- [`script/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/script)
  - [`DeployDSC.s.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/script/DeployDSC.s.sol)：部署合约并把地址写入前端
  - [`HelperConfig.s.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/script/HelperConfig.s.sol)：区分本地链与 Sepolia 的配置来源
- [`test/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/test)
  - `unit/`：单元测试
  - `fuzz/`：模糊测试与 invariant 相关代码
  - `mocks/`：测试和本地网络使用的 mock 合约
- [`tools/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools)
  - [`deploy-local-and-sync.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/deploy-local-and-sync.sh)：编译、部署、同步 ABI
  - [`seed-local-state.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/seed-local-state.sh)：给默认账户注入本地演示数据
  - [`reset-local-dev.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/reset-local-dev.sh)：本地联调主入口，串联部署、seed 和环境变量输出
  - [`sync-abi.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/sync-abi.sh)：把 `out/` 中的 ABI 复制到前端
- [`web/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web)
  - `app/`：Next.js App Router 页面
  - `components/`：协议面板组件
  - `hooks/`：链上读写和状态聚合 hooks
  - `lib/contracts/abi/`：前端使用的 ABI
  - `lib/contracts/addresses/`：前端按链 ID 读取的部署地址
  - `lib/protocol/`：协议相关前端工具函数和计算逻辑
  - `lib/config/`：wagmi / RainbowKit 配置

## 核心实现思路

### 1. 协议如何工作

这个项目不是订单撮合或市场协议，而是一个基于抵押借贷模型的稳定币协议。

- 用户把 `WETH` / `WBTC` 存入 `DSCEngine`
- 协议根据价格喂价计算总抵押价值
- 用户在健康因子允许的范围内铸造 `DSC`
- `DSC` 本质上代表一笔由抵押物支持的协议债务
- 价格下跌导致仓位不安全时，清算人可以用自己的 `DSC` 去覆盖目标用户部分债务，并拿走对应抵押物和奖励

### 2. 健康因子在这里扮演什么角色

健康因子是协议的核心风控指标。当前合约里，`mintDsc` 和 `redeemCollateral` 等关键路径都会在操作后检查健康因子：

- 健康因子过低时，铸造会回滚
- 赎回过多抵押物导致仓位不安全时，交易会回滚
- 清算只允许针对不安全仓位执行
- 清算后还要求目标仓位的健康因子必须得到改善

对于新手来说，可以先把它理解为：

> 健康因子越高，仓位越安全；低于 1 就进入可清算状态。

### 3. 前端为什么不手动维护很多地址和 ABI

这套仓库已经有一条比较清晰的“合约 -> 前端”同步路径：

- [`script/DeployDSC.s.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/script/DeployDSC.s.sol) 在部署完成后，会把最新地址直接写到：
  - [`web/lib/contracts/addresses/31337.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses/31337.json)
  - 或 [`web/lib/contracts/addresses/11155111.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses/11155111.json)
- [`tools/sync-abi.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/sync-abi.sh) 会把 Foundry 编译输出中的 ABI 同步到：
  - [`web/lib/contracts/abi/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/abi)
- 前端通过 [`web/hooks/useProtocolContracts.ts`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/hooks/useProtocolContracts.ts) 和 [`web/lib/contracts/addresses/index.ts`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses/index.ts) 读取当前链的地址配置

这意味着：

- 重新部署本地合约后，不需要手动去前端到处改地址
- 只要走对脚本流程，前端会拿到最新地址和 ABI

## 快速开始

这一节面向第一次接触仓库的新手开发者。

### 环境要求

请先确保本机已安装：

- `Node.js`：建议 `20+`
- `npm`
- `Foundry`：需要 `forge`、`cast`、`anvil`
- `jq`：用于解析地址 JSON

如果你还没有安装 Foundry：

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

如果你还没有安装 `jq`：

```bash
brew install jq
```

### 第一次 clone 后先做什么

1. 安装前端依赖
2. 准备根目录 `.env`
3. 准备前端 `web/.env.local`
4. 启动本地链
5. 运行本地部署与数据注入脚本
6. 启动前端

### 需要哪些环境变量

#### 根目录 `.env`

当前仓库中的部署和 seed 脚本会读取根目录 `.env`。

本地开发至少需要这些变量：

```bash
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
PRIVATE_KEY=<anvil 默认账户私钥或你自己的测试私钥>
USER_ADDRESS=<用于 seed 的目标账户地址，可选>
```

说明：

- `RPC_URL`：Foundry 脚本连接的节点地址
- `CHAIN_ID`：本地链通常是 `31337`
- `PRIVATE_KEY`：部署合约和执行 seed 的私钥；本地 anvil 可以直接使用默认账户私钥
- `USER_ADDRESS`：如果不填，脚本会默认使用 anvil 账户 `0xf39F...2266`

额外可选的 seed 参数：

- `WETH_MINT_AMOUNT`
- `WETH_DEPOSIT_AMOUNT`
- `WBTC_MINT_AMOUNT`
- `WBTC_DEPOSIT_AMOUNT`

如果不设置，`tools/seed-local-state.sh` 会使用脚本中的默认值。

> 当前真实情况：根目录 [`.env.example`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/.env.example) 还是空文件，所以第一次使用时需要手动创建 `.env`。这是仓库后续最值得补的一个新手友好项。

#### 前端 `web/.env.local`

前端当前会读取：

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<WalletConnect project id>
NEXT_PUBLIC_SEPOLIA_RPC_URL=<Sepolia RPC URL，可选但建议填写>
```

说明：

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`：RainbowKit / WalletConnect 需要
- `NEXT_PUBLIC_SEPOLIA_RPC_URL`：如果你想切到 Sepolia，需要可用 RPC

本地联调时，即使主要连接 `anvil`，`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 仍然必须存在，因为 [`web/lib/config/wagmi.ts`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/config/wagmi.ts) 会在缺失时直接抛错。

### 当前最简本地启动方式

安装依赖后，当前仓库最短的联调流程是：

#### 1. 启动本地链

```bash
anvil
```

#### 2. 在仓库根目录部署合约、同步前端配置并注入演示数据

```bash
./tools/reset-local-dev.sh && source ./.local-dev.env
```

这个脚本会依次做这些事：

- 调用 [`tools/deploy-local-and-sync.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/deploy-local-and-sync.sh)
- 运行 `forge build`
- 执行 [`script/DeployDSC.s.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/script/DeployDSC.s.sol) 完成部署
- 调用 [`tools/sync-abi.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/sync-abi.sh) 同步 ABI
- 调用 [`tools/seed-local-state.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/seed-local-state.sh) 给默认账户 mint 并 deposit mock 资产
- 生成 [`.local-dev.env`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/.local-dev.env)，方便你后续用 `cast` 调试

#### 3. 启动前端

```bash
cd web
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 当前真实情况 vs 理想状态

当前仓库还没有做到真正意义上的“两条主命令一把拉起”，因为：

- 根目录没有统一的 `package.json`
- 没有根级别的 `bootstrap` 命令
- 合约侧和前端侧仍然分成两套启动命令
- `.env.example` 和 `web/.env.example` 不够完整

**当前真实最简方式**

1. `anvil`
2. `./tools/reset-local-dev.sh && source ./.local-dev.env`
3. `cd web && npm run dev`

**推荐优化后的理想方式**

1. `npm run bootstrap`
2. `npm run dev`

这一点我会在文末的“后续优化建议”里展开说明。

## 当前仓库已有命令

### 根目录 / Foundry / tools

| 命令 | 当前是否存在 | 作用 |
| --- | --- | --- |
| `forge build` | 已存在 | 编译合约 |
| `forge test` | 已存在 | 运行 Foundry 测试 |
| `forge script script/DeployDSC.s.sol:DeployDSC --rpc-url ... --private-key ... --broadcast` | 已存在 | 部署合约 |
| `./tools/sync-abi.sh` | 已存在 | 同步 ABI 到前端 |
| `./tools/deploy-local-and-sync.sh` | 已存在 | 本地编译、部署并同步 ABI |
| `./tools/seed-local-state.sh` | 已存在 | 为默认账户注入本地演示数据 |
| `./tools/reset-local-dev.sh` | 已存在 | 本地开发主入口：部署 + 同步 + seed + 输出 `.local-dev.env` |
| `./tools/print-local-env.sh` | 已存在 | 打印当前本地链相关环境变量 |

### 前端 `web/`

| 命令 | 当前是否存在 | 作用 |
| --- | --- | --- |
| `npm run dev` | 已存在 | 启动 Next.js 开发服务器 |
| `npm run build` | 已存在 | 构建前端 |
| `npm run start` | 已存在 | 运行生产构建 |
| `npm run lint` | 已存在 | 运行 ESLint |

## 推荐新增，但当前仓库还没有的命令

下面这些命令**不是仓库当前已有命令**，而是推荐你后续补上的聚合入口：

| 建议命令 | 当前是否存在 | 目的 |
| --- | --- | --- |
| `npm run bootstrap` | 不存在 | 安装前端依赖、检查 env、启动本地部署与同步流程 |
| `npm run dev:web` | 不存在 | 从根目录代理到 `web/npm run dev` |
| `npm run dev:contracts` | 不存在 | 启动或提示本地链与脚本流程 |
| `npm run sync:contracts` | 不存在 | 调用 `tools/deploy-local-and-sync.sh` |
| `npm run seed:local` | 不存在 | 调用 `tools/seed-local-state.sh` |

## ABI / 地址自动同步机制

这是这个仓库里非常重要的一条工程化链路。

### 地址是怎么同步到前端的

[`script/DeployDSC.s.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/script/DeployDSC.s.sol) 在部署完成后，会调用 `_writeFrontendAddresses()`，并把结果直接写入：

- [`web/lib/contracts/addresses/31337.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses/31337.json)
- 或 [`web/lib/contracts/addresses/11155111.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses/11155111.json)

所以如果你重新部署本地链，只要走 `forge script` 或 `tools/deploy-local-and-sync.sh`，前端地址文件就会更新。

### ABI 是怎么同步到前端的

[`tools/sync-abi.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/sync-abi.sh) 会从 Foundry 编译产物中提取 ABI：

- `out/DSCEngine.sol/DSCEngine.json`
- `out/DecentralizedStableCoin.sol/DecentralizedStableCoin.json`
- `out/ERC20Mock.sol/ERC20Mock.json`

然后写入：

- [`web/lib/contracts/abi/DSCEngine.abi.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/abi/DSCEngine.abi.json)
- [`web/lib/contracts/abi/DecentralizedStableCoin.abi.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/abi/DecentralizedStableCoin.abi.json)
- [`web/lib/contracts/abi/ERC20Mock.abi.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/abi/ERC20Mock.abi.json)

### 什么时候触发同步

当前最常见的两种方式：

1. 你手动执行 [`tools/sync-abi.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/sync-abi.sh)
2. 你执行 [`tools/deploy-local-and-sync.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/deploy-local-and-sync.sh) 或 [`tools/reset-local-dev.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/reset-local-dev.sh)

### 新手应该怎么理解这条流程

如果你**重新部署合约**，最稳妥的做法不是自己去手改前端地址，而是直接重新执行：

```bash
./tools/reset-local-dev.sh
```

这样前端会拿到：

- 最新部署地址
- 最新 ABI
- 本地演示数据

### 当前流程已经顺滑到什么程度

已经比“手工复制地址 + 手工复制 ABI”顺很多，但还不算完全无脑，因为：

- 仍然依赖 shell 脚本链路
- 仍然需要你自己准备 `.env`
- 前端依赖安装和本地链启动还不在统一入口里

## 演示流程

如果你要给别人演示这个项目，推荐按下面这条最短路径走。

### 本地演示前准备

1. 启动 `anvil`
2. 运行：

```bash
./tools/reset-local-dev.sh && source ./.local-dev.env
```

3. 启动前端：

```bash
cd web
npm run dev
```

4. 浏览器打开 [http://localhost:3000](http://localhost:3000)

### 演示时建议怎么讲

首页当前的结构大致是：

- `Wallet Debug`：看当前钱包和网络是否连对
- `Protocol Overview`：解释协议做什么
- `Account Overview`：看钱包、债务、健康因子等关键状态
- `Collateral Overview`：看抵押品与 USD 价值
- `Combined Flows`：一站式体验 `deposit + mint`、`burn + redeem`
- `Manual Controls`：按原子操作演示协议动作
- `Liquidation`：展示仓位不安全时的清算入口

### 一个适合演示的顺序

1. 连接本地钱包
2. 展示默认账户已有 seed 后的抵押物状态
3. 执行一次 `mint DSC`
4. 展示 `health factor` 的变化
5. 执行一次 `burn` 或 `redeem`
6. 如果需要演示清算，再配合 mock price / 第二账户做 liquidation

这样别人很快就能看到“这个项目不是静态页面，而是一个真的能跑的协议 Demo”。

## 测试

当前仓库已经包含单元测试、模糊测试和 invariant 相关测试代码。

运行测试：

```bash
forge test
```

相关目录：

- [`test/unit/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/test/unit)
- [`test/fuzz/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/test/fuzz)
- [`test/mocks/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/test/mocks)

## 常见问题 / 踩坑指南

### 1. 前端起不来，提示 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set`

原因：

- [`web/lib/config/wagmi.ts`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/config/wagmi.ts) 会在缺少这个环境变量时直接报错

处理方式：

- 在 `web/.env.local` 中补上 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 2. 重新部署后，前端读到的还是旧地址

原因：

- 你可能只重新部署了合约，但没有重新同步地址和 ABI

处理方式：

```bash
./tools/reset-local-dev.sh
```

然后刷新前端页面。

### 3. 钱包连上了，但页面没有协议数据

常见原因：

- 钱包网络不是 `31337`
- 本地链没启动
- 前端地址文件和当前链不一致

优先检查：

- `anvil` 是否在运行
- 页面连接的是否是本地 Foundry/Hardhat 网络
- [`web/lib/contracts/addresses/31337.json`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses/31337.json) 是否是最新部署结果

### 4. 本地 `WBTC` 显示精度和真实比特币不一样

当前本地链使用的是 OpenZeppelin 的 `ERC20Mock`，在本地网络里 `WBTC` mock 默认是 `18 decimals`，不是主网常见的 `8 decimals`。这一点会影响本地 seed 数量和前端单位处理，但不影响协议主流程演示。

### 5. 本地价格一直不变

这是正常的。当前 `anvil` 环境里用的是 [`MockV3Aggregator`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/test/mocks/MockV3Aggregator.sol)，价格不是实时市场价，而是脚本里写死的 mock 值。Sepolia 才会使用真实 Chainlink Feed。

### 6. 本地钱包交易出现 `nonce too low`

这通常不是协议逻辑问题，而是本地链重置后钱包缓存了旧 nonce。切换网络、清理钱包本地活动记录，或重新连接当前本地账户即可。

## 后续优化建议

如果你的目标是把这个仓库做成“新手 clone 下来就能很快跑起来”的开源项目，最值得优先做的不是再加协议功能，而是补齐工程体验。

### 1. 增加根目录 `package.json`

目标：

- 把分散在 `tools/` 和 `web/` 的开发命令聚合起来
- 让新手不需要记很多 shell 脚本路径

优先建议的 scripts：

- `bootstrap`
- `dev`
- `dev:web`
- `sync:contracts`
- `seed:local`

### 2. 补齐根目录 `.env.example`

当前这是最明显的新手阻塞项之一。至少应该提供本地开发所需的最小模板，并标注哪些是必填，哪些是可选。

### 3. 增加 `web/.env.example`

现在前端环境变量散落在 [`web/.env.local`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/.env.local) 里，不利于开源仓库的首次使用体验。应该提供一个可直接复制的示例文件。

### 4. 把“安装依赖 + 部署 + seed + 启动前端”收敛为两个主命令

理想体验：

```bash
npm run bootstrap
npm run dev
```

其中：

- `bootstrap`：检查依赖、安装前端依赖、提示 env、执行 `reset-local-dev.sh`
- `dev`：启动 `web` 前端，并打印本地链使用说明

### 5. 增加一份更偏工程视角的架构文档

比如新增：

- `docs/architecture.md`
- `docs/local-development.md`

这样 README 可以专注“快速上手”，更细的实现细节放到文档里展开。

### 6. 增强演示数据和演示脚本

目前已经有 `seed-local-state.sh`，但还可以继续完善：

- 增加“清算演示”专用脚本
- 增加 mock price 调整脚本
- 增加第二账户的预置步骤

这样面试或 demo 时会更稳定。

## 相关文件入口

- 根 README：[`README.md`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/README.md)
- 前端入口页面：[`web/app/page.tsx`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/app/page.tsx)
- 协议核心合约：[`src/DSCEngine.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/src/DSCEngine.sol)
- 稳定币合约：[`src/DecentralizedStableCoin.sol`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/src/DecentralizedStableCoin.sol)
- 本地开发主脚本：[`tools/reset-local-dev.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/reset-local-dev.sh)
- ABI 同步脚本：[`tools/sync-abi.sh`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/tools/sync-abi.sh)
- 地址配置：[`web/lib/contracts/addresses/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/addresses)
- ABI 配置：[`web/lib/contracts/abi/`](/Volumes/DevDisk/Dev/projects/Web/open/defi-stablecoin/web/lib/contracts/abi)
