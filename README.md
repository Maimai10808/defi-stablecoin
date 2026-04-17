# defi-stablecoin

这是我之前做的一个基于 Foundry 的去中心化稳定币项目。这个项目的核心目标，是实现一个最小化的、超额抵押的美元稳定币系统。用户可以把 `WETH` 和 `WBTC` 这类外部资产抵押进协议，然后按抵押品价值铸造稳定币 `DSC`。

先启动本地链：

anvil

然后另开一个终端，在项目根目录执行：

./tools/reset-local-dev.sh

这个命令现在的含义就是：1. forge build 编译 2. sync-abi.sh 同步 ABI 到前端 3. DeployDSC.s.sol 部署合约 4. 部署脚本自动把最新地址写进 31337.json

# 1. 开本地链

anvil

# 2. 部署并同步给前端

./tools/reset-local-dev.sh

# 3. 启动前端

cd web
npm run dev

我做这个项目的出发点，不是去复刻一个完整的 MakerDAO，而是自己把稳定币协议里最核心的几个机制真正写一遍、跑一遍、测一遍，包括：

- 抵押品存入
- 稳定币铸造
- 健康因子计算
- 抵押品赎回
- 稳定币销毁
- 清算流程

这个 README 我按“面试讲解”的思路来写。你可以把它当成项目介绍、复习笔记和讲稿。

---

## 1. 这个项目是干什么的

如果我要用一句话介绍这个项目，我会这样说：

> 这是我用 Solidity 和 Foundry 写的一个去中心化超额抵押稳定币原型。用户可以抵押 WETH 和 WBTC，协议通过 Chainlink 价格预言机计算抵押品价值，然后允许用户铸造美元锚定的稳定币 DSC。为了控制风险，我在协议里实现了健康因子和清算机制，保证系统整体抵押价值尽量始终高于稳定币总供应量。

更通俗一点说，这个项目解决的是一个典型 DeFi 问题：

- 用户想获得稳定币流动性
- 但协议不能无抵押放贷
- 所以用户需要先抵押波动资产
- 协议根据抵押品价值，限制他最多能铸造多少稳定币
- 如果用户仓位变得不安全，就允许别人来清算

---

## 2. 我在面试里会怎么讲这个项目

### 2.1 30 秒版本

如果面试官时间很短，我会这样讲：

> 我做了一个 DeFi 稳定币原型项目，核心是一个超额抵押模型。用户可以抵押 WETH 和 WBTC，协议通过 Chainlink Price Feed 计算美元价值，然后铸造稳定币 DSC。为了保证系统安全，我实现了健康因子、抵押率约束和清算逻辑。这个项目主要是为了让我完整走一遍稳定币协议的核心机制，而不是只停留在概念层。

### 2.2 1 到 2 分钟版本

如果让我稍微展开一点，我会这样讲：

> 这个项目本质上是一个简化版的超额抵押稳定币系统，有点类似 MakerDAO 的最小实现。我把系统拆成两个核心合约。
> 一个是 `DecentralizedStableCoin`，它本身就是稳定币 `DSC`，负责 ERC20 的 mint 和 burn。
> 另一个是 `DSCEngine`，它是整个协议的业务核心，负责管理抵押品、计算用户仓位价值、控制铸造额度、处理赎回和清算。
>
> 用户先把 WETH 或 WBTC 存进协议，协议通过 Chainlink 预言机获取价格，把抵押品换算成美元价值，然后根据健康因子判断用户最多能铸造多少 DSC。
>
> 我这里设定了一个 50% 的 liquidation ratio，本质上对应用户大致需要维持 200% 左右的抵押率，健康因子不能低于 1。如果用户因为市场波动导致健康因子跌破阈值，其他人就可以用 DSC 替他偿还部分债务，并拿走一部分抵押品，同时获得 10% 的 liquidation bonus。
>
> 除了实现主流程，我还用 Foundry 写了单元测试和 invariant test，重点验证系统总抵押价值不能低于稳定币总供应量。这让我不仅实现了功能，还把协议最关键的安全约束也验证了一遍。

### 2.3 更像“我自己做了什么”的版本

如果面试官更关心“你到底做了什么”，我会这样讲：

> 这个项目里我自己重点做了三件事。
> 第一，我把稳定币协议的核心状态机写清楚了，也就是抵押、铸造、销毁、赎回和清算之间的关系。
> 第二，我把价格预言机引进来，做了抵押品美元估值和健康因子计算，让协议能根据风险做约束。
> 第三，我补了测试，尤其是单元测试和 invariant test，去验证协议在不同操作下仍然保持“抵押价值 >= 稳定币供应量”这个关键安全性质。
>
> 所以这个项目对我来说不只是写了几个合约，而是把一个典型 DeFi 协议的核心机制真正落到了代码和测试里。

---

## 3. 项目架构

这个项目最核心的代码主要集中在下面几个文件里：

- [src/DSCEngine.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/src/DSCEngine.sol)
- [src/DecentralizedStableCoin.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/src/DecentralizedStableCoin.sol)
- [script/DeployDSC.s.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/script/DeployDSC.s.sol)
- [script/HelperConfig.s.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/script/HelperConfig.s.sol)
- [test/unit/DSCEngineTest.t.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/test/unit/DSCEngineTest.t.sol)
- [test/fuzz/OpenInvariantsTest.t.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/test/fuzz/OpenInvariantsTest.t.sol)

### 3.1 `DecentralizedStableCoin.sol`

这个合约是稳定币本体。

我这里让它继承了 OpenZeppelin 的 `ERC20Burnable` 和 `Ownable`，并且只允许 owner 去调用 `mint` 和 `burn`。部署完成后，我会把这个合约的 ownership 转移给 `DSCEngine`，这样稳定币的发行和销毁权就统一由协议引擎控制。

这个设计的好处是职责比较清楚：

- `DSC` 合约只负责“币”
- `DSCEngine` 负责“规则”

### 3.2 `DSCEngine.sol`

这个合约是整个协议的核心。

我把主要逻辑都放在这里，包括：

- 存抵押品 `depositCollateral`
- 存抵押品并铸币 `depositCollateralAndMintDsc`
- 铸造 DSC `mintDsc`
- 销毁 DSC `burnDsc`
- 赎回抵押品 `redeemCollateral`
- 销毁后赎回 `redeemCollateralForDsc`
- 清算 `liquidate`

这个合约内部维护了几类关键状态：

- 每种抵押品对应的价格预言机地址
- 每个用户存了多少抵押品
- 每个用户铸造了多少 DSC
- 协议支持哪些抵押品

---

## 4. 这个协议是怎么跑起来的

如果我要从业务流程角度讲，我会这样说：

### 第一步：用户先存入抵押品

用户先把协议支持的抵押资产，比如 WETH 或 WBTC，转进协议。

协议会记录：

- 谁存的
- 存的是哪种币
- 存了多少

### 第二步：协议根据预言机计算抵押品价值

协议接入了 Chainlink Price Feed。
也就是说，用户虽然存进来的是 ETH 或 BTC 这种波动资产，但协议内部会把它们统一换算成美元价值。

这样后面在判断用户能铸造多少 DSC 时，就有统一计价标准。

### 第三步：用户基于抵押品铸造 DSC

用户可以根据自己当前抵押品的美元价值去铸造 DSC。

但这里不是想铸多少就铸多少，因为协议会检查健康因子。

### 第四步：协议用健康因子限制风险

健康因子本质上是在衡量：

> 这个用户的抵押品，是否足够覆盖他已经铸造出来的稳定币债务。

在这个实现里：

- `LIQUIDATION_RATIO = 50`
- `MIN_HEALTH_FACTOR = 1e18`

它的含义可以直接讲成：

> 我要求用户整体上大致保持 200% 抵押率，只有这样他的仓位才足够安全。

如果用户铸造太多 DSC，或者抵押品价格下跌，健康因子就会下降。
一旦健康因子低于最小阈值，这个仓位就会进入可清算状态。

### 第五步：不安全仓位会被清算

当仓位不安全时，其他用户可以发起清算。

清算流程是：

1. 清算人拿自己的 DSC 来偿还一部分坏账
2. 协议把被清算用户的一部分抵押品给清算人
3. 清算人还能拿到额外 10% 的 bonus

这样协议就能通过市场机制，把风险仓位逐步修复掉。

---

## 5. 这个项目里我想体现的技术点

如果面试官问“你通过这个项目体现了什么能力”，我建议你往这几个方向讲。

### 5.1 我理解了 DeFi 协议的核心状态约束

这不是一个简单 ERC20 项目，而是一个有风险控制的协议。

我在这个项目里真正处理了：

- 抵押资产和债务的关系
- 铸造上限的约束
- 健康因子建模
- 清算激励设计

这说明我不是只会写功能代码，而是能把协议规则抽象成合约逻辑。

### 5.2 我把预言机接进了核心逻辑

这个项目不是纯本地数学游戏，因为稳定币协议一定要知道抵押品现在值多少钱。

所以我把 Chainlink Price Feed 接到了协议里，并做了精度换算，让合约内部可以统一用 18 位精度做价值计算。

这个点面试里很值得讲，因为它体现你知道链上协议不是孤立运行的，很多逻辑都依赖外部数据源。

### 5.3 我考虑了协议安全边界

我在 `DSCEngine` 里加了：

- 白名单抵押品限制
- `ReentrancyGuard`
- 健康因子检查
- 清算后 health factor 必须改善的约束

这说明你不是只考虑 happy path，而是开始考虑协议什么时候应该 revert、什么时候会有风险。

### 5.4 我补了测试而不是只写功能

这个项目有单元测试，也有 invariant test。

我会重点强调这一点：

> 我不是只验证某个函数能不能调用成功，而是去验证协议在一系列操作之后，仍然满足最关键的不变量，比如“总抵押价值 >= 稳定币总供应量”。

这个表达在面试里会比单纯说“我写了测试”更有分量。

---

## 6. 面试时可以直接复述的讲稿

下面这段你可以直接背，或者改成你自己的说法。

> 这个项目是我自己写的一个去中心化稳定币协议原型，主要目的是把 DeFi 里超额抵押稳定币的核心机制完整实现一遍。
> 我把系统拆成两个主要合约，一个是稳定币 `DSC` 本身，另一个是协议引擎 `DSCEngine`。`DSCEngine` 负责管理抵押品、根据 Chainlink 价格预言机计算抵押资产价值、控制用户铸造稳定币的额度，并在用户仓位不安全时触发清算。
>
> 这个协议支持 WETH 和 WBTC 作为抵押品。用户先存入抵押品，协议把它们转换成美元价值，然后允许用户按一定抵押率去铸造 DSC。我这里实现了 health factor 机制，本质上就是用来判断用户的抵押品是否足够覆盖债务。为了让系统更安全，我设置了较高的超额抵押要求，并且当健康因子跌破阈值时，允许外部清算人偿还债务并拿走一部分抵押品，同时获得清算奖励。
>
> 这个项目里我觉得比较有价值的部分，不只是把合约功能写出来，而是把协议的核心约束也做了测试验证。我用 Foundry 写了 unit test 和 invariant test，重点去验证系统整体抵押价值不能低于稳定币总供应量。这个过程让我对稳定币协议的核心机制、风险控制和测试方法都有了更具体的理解。

---

## 7. 面试官如果继续追问，我可以怎么答

### Q1: 你为什么要把系统拆成两个合约？

我会这样答：

> 因为我想把“资产本体”和“协议规则”分开。`DecentralizedStableCoin` 只负责代币本身的 mint 和 burn，而 `DSCEngine` 负责所有业务规则，比如抵押、赎回、健康因子和清算。这样职责更清楚，也更接近真实协议设计。

### Q2: 健康因子是什么？

我会这样答：

> 健康因子本质上是一个风险指标，用来衡量用户当前抵押品是否足够覆盖他已经铸造出来的稳定币债务。抵押品价值越高，健康因子越高；债务越多，健康因子越低。低于阈值时，这个账户就可以被清算。

### Q3: 为什么要用 Chainlink？

我会这样答：

> 因为协议必须知道抵押品的实时美元价值，否则没法判断用户到底能铸造多少稳定币，也没法判断仓位是否需要清算。Chainlink 是比较典型的链上价格预言机方案，适合这种场景。

### Q4: 你这个项目最关键的安全约束是什么？

我会这样答：

> 我认为最关键的约束是协议整体的抵押品美元价值，至少不能低于稳定币总供应量。所以我专门写了 invariant test 去验证这一点。对稳定币系统来说，这类系统级约束比单个函数能不能跑通更重要。

### Q5: 这个项目还有哪些不足？

我会这样答：

> 这是一个原型项目，不是生产级协议。它还有一些可以继续补的地方，比如更完整的清算路径测试、更加真实的 fuzz handler、预言机异常情况处理、以及更深入的经济模型验证和安全审计。

这个回答很重要，因为它说明你知道项目边界，而不是把原型说成产品。

---

## 8. 从代码角度，我最该回忆哪几个点

如果你面试前时间不多，我建议你优先回忆下面这些点：

1. `DSCEngine` 管什么状态
2. 用户从抵押到铸造的完整流程
3. 健康因子是怎么约束 mint 的
4. 为什么健康因子低了之后能被清算
5. `DSC` 为什么要交给 `DSCEngine` 持有所有权
6. 你写了哪些测试，尤其是不变量测试

把这 6 个点讲顺了，这个项目基本就能讲清楚。

---

## 9. 项目文件

- [src/DSCEngine.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/src/DSCEngine.sol)
- [src/DecentralizedStableCoin.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/src/DecentralizedStableCoin.sol)
- [script/DeployDSC.s.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/script/DeployDSC.s.sol)
- [script/HelperConfig.s.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/script/HelperConfig.s.sol)
- [test/unit/DSCEngineTest.t.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/test/unit/DSCEngineTest.t.sol)
- [test/fuzz/OpenInvariantsTest.t.sol](/Users/mac/Desktop/Web/open/defi-stablecoin/test/fuzz/OpenInvariantsTest.t.sol)

## 10. 本地运行

### 安装依赖

```bash
git submodule update --init --recursive
```

### 编译

```bash
forge build
```

### 测试

```bash
forge test
```

### 运行不变量测试

```bash
forge test --match-path test/fuzz/OpenInvariantsTest.t.sol
```

### 本地部署

先启动：

```bash
anvil
```

再部署：

```bash
forge script script/DeployDSC.s.sol:DeployDSC --rpc-url http://127.0.0.1:8545 --broadcast
```

---

## 11. 最后一句怎么收尾

如果面试官问完以后，你想用一句话把这个项目收住，我建议你这样说：

> 这个项目对我最大的价值，是让我把稳定币协议从“知道概念”推进到了“能自己实现核心机制、理解风险约束、并用测试验证协议行为”的阶段。
