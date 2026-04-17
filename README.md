# DSCoin

[中文](#中文说明) | [English](#english)

---

## 中文说明

### 项目简介

`DSCoin` 是一个基于超额抵押模型实现的去中心化稳定币协议示例项目。  
项目使用 Solidity + Foundry 编写核心智能合约，接入 Chainlink Price Feeds 获取实时价格数据，并通过健康因子与清算机制管理协议风险。同时提供了一个基于 Next.js 的前端 Demo，用于演示抵押、铸造、赎回、销毁与清算等核心流程。

### 项目亮点

- 基于 `Foundry` 完成合约开发、部署脚本、单元测试、交互测试和模糊测试
- 接入 `Chainlink Price Feeds`，将 `WETH`、`WBTC` 等波动资产统一换算为美元价值
- 实现基于健康因子的清算逻辑，用于管理风险仓位
- 将稳定币本体与协议引擎拆分为两个核心合约，职责清晰
- 提供 `Next.js + wagmi + RainbowKit` 前端 Demo，完整演示协议主流程
- 测试覆盖率达到约 `95%`

### 智能合约设计

协议核心由两个主要合约组成：

#### 1. `DecentralizedStableCoin`

稳定币本体，负责 `DSC` 的发行与销毁。

- 基于 ERC20 实现
- `mint` / `burn` 权限由协议引擎统一控制
- 将“代币逻辑”和“协议规则”解耦

#### 2. `DSCEngine`

协议业务核心，负责管理抵押资产、债务、价格换算和清算逻辑。

主要职责包括：

- 存入抵押品
- 铸造 DSC
- 销毁 DSC
- 赎回抵押品
- 计算账户总抵押价值
- 计算健康因子
- 在健康因子过低时执行清算

### 协议工作流程

1. 用户存入 `WETH` 或 `WBTC` 作为抵押品。
2. 协议通过 Chainlink 价格预言机计算抵押品的美元价值。
3. 用户在满足抵押率要求的前提下铸造 `DSC`。
4. 如果市场波动导致仓位风险上升，健康因子下降。
5. 当健康因子低于阈值时，其他用户可以发起清算，偿还部分债务并获得对应抵押品和清算奖励。

### 风险控制机制

- 超额抵押：协议不允许无抵押铸币
- Health Factor：用于衡量当前仓位是否安全
- Liquidation：当仓位不安全时允许外部清算
- Chainlink 喂价：避免使用本地硬编码价格
- Reentrancy 防护与白名单抵押品控制

### 测试

这个项目强调的不只是“功能可用”，还包括“协议约束成立”。

测试内容包括：

- 单元测试
- 交互测试
- 模糊测试（Fuzz Testing）
- 协议不变量测试

重点验证：

- 抵押、铸造、销毁、赎回、清算等核心路径
- 抵押品价值与债务之间的关系是否始终满足协议约束
- 系统在不同输入和极端情况下的健壮性

### 前端说明

项目包含一个基于 `Next.js` 的前端演示页面，主要用于展示协议核心功能，而不是做成完整商业产品。

前端当前主要包含：

- 协议说明模块
- 账户总览与抵押品总览
- 抵押 / 铸造 / 销毁 / 赎回操作
- 组合流程操作
- 清算模块
- `WETH / WBTC` 双抵押品演示

前端的目标是帮助别人快速理解：

- 这个协议能做什么
- 协议的风险控制是如何工作的
- 合约和前端是如何对接的

### 技术栈

#### 合约侧

- Solidity
- Foundry
- OpenZeppelin
- Chainlink

#### 前端侧

- Next.js
- React
- TypeScript
- Tailwind CSS
- wagmi
- RainbowKit
- viem

### 项目结构

```text
.
├── src/                     # 核心智能合约
├── script/                  # Foundry 部署与配置脚本
├── test/                    # 单元测试 / 模糊测试 / 不变量测试
├── tools/                   # 本地开发辅助脚本
├── web/                     # Next.js 前端
│   ├── app/                 # App Router 页面
│   ├── components/          # 前端组件
│   ├── hooks/               # 合约交互 hooks
│   └── lib/contracts/       # ABI 与部署地址
└── README.md
```

### 本地开发

#### 1. 启动本地链

```bash
anvil
```

#### 2. 部署合约并同步到前端

在项目根目录执行：

```bash
./tools/reset-local-dev.sh && source ./.local-dev.env
```

这个脚本会完成以下事情：

- 编译 Foundry 合约
- 部署本地合约
- 同步 ABI 到前端
- 将最新地址写入 `web/lib/contracts/addresses/31337.json`
- 预置本地演示状态
- 生成 `.local-dev.env` 供后续脚本和调试使用

#### 3. 启动前端

```bash
cd web
npm run dev
```

默认启动后可以在本地浏览器中访问前端 Demo。

### 常用开发命令

#### 运行测试

```bash
forge test
```

#### 查看覆盖率

```bash
forge coverage
```

#### 构建前端

```bash
cd web
npm run build
```

### Demo 演示建议

如果你要向别人展示这个项目，建议按下面的顺序演示：

1. 连接钱包
2. 查看账户总览和抵押品信息
3. 存入 `WETH` 或 `WBTC`
4. 铸造 `DSC`
5. 展示 health factor 的变化
6. 进行销毁和赎回
7. 最后演示清算逻辑

这样可以完整体现这个协议的闭环，而不只是展示单个按钮交互。

### 为什么这个项目有价值

这个项目体现的不是单一合约开发，而是一套完整的 DeFi 协议实现能力：

- 能把协议规则抽象为智能合约状态机
- 能接入预言机并做价格换算
- 能设计风险控制与清算机制
- 能使用 Foundry 对协议安全性做系统验证
- 能把链上协议通过前端页面可视化演示出来

### 后续可扩展方向

- 支持更多抵押品类型
- 增加更完整的前端交易状态反馈
- 接入测试网部署
- 增加协议参数治理能力
- 增加事件分析与数据看板

---

## English

### Overview

`DSCoin` is a decentralized stablecoin protocol demo built around an overcollateralization model.  
The project uses Solidity + Foundry for the core smart contracts, integrates Chainlink Price Feeds for real-time asset pricing, and manages protocol risk through a health-factor-driven liquidation mechanism. It also includes a Next.js frontend demo for showcasing the full collateralize / mint / burn / redeem / liquidate workflow.

### Highlights

- Built with `Foundry` for contract development, deployment scripts, unit tests, interaction tests, and fuzz testing
- Integrates `Chainlink Price Feeds` to convert volatile collateral assets such as `WETH` and `WBTC` into USD-denominated values
- Implements a health-factor-based liquidation system for risky positions
- Separates the stablecoin token and the protocol engine into two focused contracts
- Includes a `Next.js + wagmi + RainbowKit` frontend demo for end-to-end protocol interaction
- Achieves roughly `95%` test coverage

### Smart Contract Architecture

The protocol is centered around two main contracts:

#### 1. `DecentralizedStableCoin`

The stablecoin token contract responsible for minting and burning `DSC`.

- ERC20-based implementation
- `mint` / `burn` permissions are controlled by the protocol engine
- Clean separation between token logic and protocol rules

#### 2. `DSCEngine`

The protocol engine that manages collateral, debt accounting, pricing, and liquidation.

Core responsibilities include:

- Depositing collateral
- Minting DSC
- Burning DSC
- Redeeming collateral
- Calculating total account collateral value
- Calculating health factor
- Executing liquidations for unhealthy positions

### Protocol Flow

1. A user deposits `WETH` or `WBTC` as collateral.
2. The protocol uses Chainlink price feeds to calculate the USD value of that collateral.
3. The user mints `DSC` within the allowed collateralization bounds.
4. If market volatility causes the position to become risky, the health factor decreases.
5. Once the health factor falls below the threshold, third parties can liquidate part of the debt in exchange for collateral plus a liquidation bonus.

### Risk Controls

- Overcollateralization: minting without collateral is not allowed
- Health Factor: measures whether a position remains safe
- Liquidation: unsafe positions can be repaired by external liquidators
- Chainlink pricing: avoids hardcoded local pricing assumptions
- Reentrancy protection and collateral allowlist controls

### Testing

This project focuses not only on feature completeness, but also on protocol safety guarantees.

Testing includes:

- Unit tests
- Interaction tests
- Fuzz testing
- Invariant testing

Key properties verified:

- Core flows such as deposit, mint, burn, redeem, and liquidation
- The relationship between collateral value and outstanding debt
- Protocol robustness across varied and edge-case inputs

### Frontend

The repository also includes a `Next.js` frontend demo designed to showcase the protocol rather than act as a production product UI.

The frontend currently includes:

- Protocol overview modules
- Account and collateral overview panels
- Deposit / mint / burn / redeem flows
- Combined workflow operations
- Liquidation module
- `WETH / WBTC` multi-collateral interaction

Its main purpose is to help users quickly understand:

- What the protocol does
- How the risk model works
- How the frontend integrates with the contracts

### Tech Stack

#### Contracts

- Solidity
- Foundry
- OpenZeppelin
- Chainlink

#### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- wagmi
- RainbowKit
- viem

### Project Structure

```text
.
├── src/                     # Core smart contracts
├── script/                  # Foundry deployment and config scripts
├── test/                    # Unit / fuzz / invariant tests
├── tools/                   # Local development helper scripts
├── web/                     # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # Frontend components
│   ├── hooks/               # Contract interaction hooks
│   └── lib/contracts/       # ABI and deployment addresses
└── README.md
```

### Local Development

#### 1. Start a local chain

```bash
anvil
```

#### 2. Deploy contracts and sync them to the frontend

From the project root:

```bash
./tools/reset-local-dev.sh && source ./.local-dev.env
```

This script will:

- Build the Foundry contracts
- Deploy contracts locally
- Sync ABI artifacts to the frontend
- Write the latest addresses into `web/lib/contracts/addresses/31337.json`
- Seed local demo state
- Generate `.local-dev.env` for local development and debugging

#### 3. Start the frontend

```bash
cd web
npm run dev
```

Once started, the local frontend demo will be available in the browser.

### Common Commands

#### Run tests

```bash
forge test
```

#### Generate coverage

```bash
forge coverage
```

#### Build the frontend

```bash
cd web
npm run build
```

### Suggested Demo Flow

If you want to present the project to others, a good demo order is:

1. Connect wallet
2. Inspect account and collateral overview
3. Deposit `WETH` or `WBTC`
4. Mint `DSC`
5. Show the health factor update
6. Burn and redeem
7. Finally demonstrate liquidation

That sequence makes the full protocol loop easy to understand.

### Why This Project Matters

This is not just an ERC20 exercise. It demonstrates the ability to build a complete DeFi protocol flow:

- Translating protocol rules into a smart-contract state machine
- Integrating oracle pricing into core business logic
- Designing health-factor and liquidation-based risk controls
- Using Foundry to validate safety properties systematically
- Exposing the protocol through a usable frontend demo

### Possible Extensions

- Support more collateral types
- Add richer frontend transaction feedback
- Deploy to public testnets
- Add governance over protocol parameters
- Add analytics and dashboarding

---

If you are learning about decentralized stablecoins, DeFi risk controls, or full-stack blockchain development with contracts plus frontend integration, this repository can serve as a solid reference implementation.
