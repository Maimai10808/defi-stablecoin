# DSCoin Contract Interface README

这份文档用于说明 `DSCoin` 项目中核心智能合约的接口设计、职责分层，以及每个主要函数的作用与调用语义。

---

## 1. 合约整体结构

这个协议的核心由 3 个部分组成：

### 1. `DSCEngine.sol`

协议的核心业务引擎，负责：

- 接收抵押品
- 计算抵押品 USD 价值
- 控制 `DSC` 的铸造与销毁
- 维护用户债务
- 计算健康因子
- 处理清算逻辑

可以把它理解为：

> “协议规则层”

### 2. `DecentralizedStableCoin.sol`

稳定币本体，也就是 `DSC` 代币合约。

它负责：

- ERC20 基本功能
- 由 `DSCEngine` 控制的 mint / burn

可以把它理解为：

> “稳定币资产层”

### 3. `IDecentralizedStableCoin.sol`

这是 `DSCEngine` 对外暴露的核心接口定义，描述了协议支持的主要动作：

- deposit
- mint
- burn
- redeem
- liquidate

它的作用主要是：

- 统一接口语义
- 方便阅读协议对外能力
- 方便测试或前端理解协议入口

---

## 2. 协议核心逻辑

这个项目实现的是一个“超额抵押稳定币协议”。

基本规则是：

1. 用户先存入抵押品（`WETH` / `WBTC`）
2. 协议通过预言机获取价格，计算抵押品的美元价值
3. 用户在安全范围内铸造 `DSC`
4. 协议通过 `Health Factor` 检查仓位是否安全
5. 用户可以销毁 `DSC` 来减少债务
6. 用户可以赎回抵押品
7. 当仓位不安全时，其他人可以发起清算

也就是说，这个协议形成了完整闭环：

`deposit -> mint -> monitor -> burn -> redeem -> liquidate`

---

## 3. 事件（Events）

### `CollateralDeposited`

```solidity
event CollateralDeposited(
    address indexed user,
    address collateralToken,
    uint256 collateralAmount
);
```

含义：

- 某个用户向协议存入了某种抵押品

用途：

- 前端展示存款记录
- 索引器追踪用户仓位变化

### `CollateralRedeemed`

```solidity
event CollateralRedeemed(
    address indexed from,
    address indexed to,
    address collateralToken,
    uint256 collateralAmount
);
```

含义：

- 某个地址的抵押品余额被减少，并转移给另一个地址

这个事件既可以用于：

- 用户自己赎回抵押品
- 清算时把抵押品转给 liquidator

---

## 4. `DSCEngine` 主要函数说明

下面按协议流程来解释每个函数。

---

### 4.1 `depositCollateral`

```solidity
function depositCollateral(
    address collateralToken,
    uint256 collateralAmount
) external;
```

#### 作用

向协议中存入抵押品。

#### 参数说明

- `collateralToken`：抵押品地址，目前支持 `WETH` / `WBTC`
- `collateralAmount`：存入数量

#### 调用前提

- `collateralAmount > 0`
- `collateralToken` 必须在协议白名单中
- 用户必须先对 `DSCEngine` 调用对应 ERC20 的 `approve`

#### 调用结果

- 协议记录用户存入了多少抵押品
- 抵押品从用户钱包转入协议合约
- 触发 `CollateralDeposited` 事件

#### 解释

这是用户进入协议的第一步。没有抵押品，就没有后续的 mint 能力。

---

### 4.2 `depositCollateralAndMintDsc`

```solidity
function depositCollateralAndMintDsc(
    address collateralToken,
    uint256 collateralAmount,
    uint256 dscAmountToMint
) external;
```

#### 作用

一次交易里完成：

- 存抵押品
- 铸造 DSC

#### 参数说明

- `collateralToken`：抵押品地址
- `collateralAmount`：存入的抵押品数量
- `dscAmountToMint`：希望铸造的 DSC 数量

#### 调用结果

本质上是顺序调用：

1. `depositCollateral`
2. `mintDsc`

#### 解释

这是一个更贴近真实用户体验的组合函数。比起手动拆成两个步骤，它更容易展示完整业务闭环。

---

### 4.3 `mintDsc`

```solidity
function mintDsc(uint256 dscAmountToMint) external;
```

#### 作用

在当前抵押品支持下铸造稳定币 `DSC`。

#### 参数说明

- `dscAmountToMint`：要铸造的 DSC 数量

#### 协议内部逻辑

1. 增加用户的已铸造债务记录
2. 检查 health factor 是否仍然安全
3. 如果安全，则调用 `DSC.mint()`

#### 调用失败的典型情况

- 铸造太多，导致健康因子低于最小阈值
- `DSC` mint 失败

#### 解释

这个函数体现了协议的核心风险约束：
不是“有抵押就能无限铸币”，而是铸币后仓位仍然必须安全。

---

### 4.4 `burnDsc`

```solidity
function burnDsc(uint256 dscAmountToBurn) external;
```

#### 作用

销毁用户持有的 `DSC`，同时减少该用户的债务。

#### 参数说明

- `dscAmountToBurn`：要销毁的 DSC 数量

#### 调用前提

- 用户必须持有足够的 DSC
- 用户必须先对 `DSCEngine` 执行 `approve`

#### 协议内部逻辑

1. 减少用户的已铸造债务
2. 从用户地址转入 DSC 到协议
3. 由 `DSCEngine` 调用 `DSC.burn()`

#### 解释

这一步本质上是“还债”。
用户不是单纯销毁代币，而是在减少自己在协议中的负债。

---

### 4.5 `redeemCollateral`

```solidity
function redeemCollateral(
    address collateralToken,
    uint256 collateralAmount
) external;
```

#### 作用

从协议中赎回用户已经存入的抵押品。

#### 参数说明

- `collateralToken`：要赎回的抵押品地址
- `collateralAmount`：要赎回的数量

#### 协议内部逻辑

1. 减少用户的抵押品余额
2. 将抵押品转回用户钱包
3. 检查 health factor 是否仍然安全

#### 调用失败的典型情况

- 赎回后健康因子下降到安全阈值以下

#### 解释

用户虽然可以取回抵押品，但不能把自己仓位变成不安全状态。

---

### 4.6 `redeemCollateralForDsc`

```solidity
function redeemCollateralForDsc(
    address collateralToken,
    uint256 collateralAmount,
    uint256 dscAmountToBurn
) external;
```

#### 作用

一次交易完成：

- 销毁 DSC
- 赎回抵押品

#### 参数说明

- `collateralToken`：要赎回的抵押品
- `collateralAmount`：赎回数量
- `dscAmountToBurn`：用于偿还债务的 DSC 数量

#### 协议内部逻辑

1. 先调用 `burnDsc`
2. 再调用内部赎回逻辑
3. 最后检查 health factor

#### 解释

这是“关闭仓位”或者“部分去杠杆”的组合入口，适合前端展示完整还款路径。

---

### 4.7 `liquidate`

```solidity
function liquidate(
    address collateralToken,
    address userToLiquidate,
    uint256 debtToCover
) external;
```

#### 作用

清算一个健康因子已经跌破阈值的用户仓位。

#### 参数说明

- `collateralToken`：本次清算要拿走的抵押品类型
- `userToLiquidate`：被清算用户
- `debtToCover`：清算人愿意代偿的债务数量（DSC）

#### 协议内部逻辑

1. 检查目标用户当前 `health factor < 1`
2. 根据 `debtToCover` 计算等价抵押品数量
3. 给清算人额外的 `10%` 清算奖励
4. 从目标用户抵押品中扣除相应数量，转给 liquidator
5. liquidator 提供 DSC，协议 burn 掉这部分债务
6. 检查目标用户 health factor 是否改善

#### 为什么要有 liquidation bonus

因为清算行为需要外部激励。
没有奖励，就没人愿意主动修复坏仓位。

#### 解释

清算机制不是协议附加功能，而是超额抵押稳定币系统最关键的风险处理机制之一。

---

## 5. Health Factor 相关逻辑

### `_healthFactor`

```solidity
function _healthFactor(address user) internal view returns (uint256);
```

#### 作用

计算某个用户当前仓位的健康因子。

#### 依赖信息

- 用户总债务：`totalDscMinted`
- 用户总抵押品价值：`collateralValueInUsd`

---

### `_calculateHealthFactor`

```solidity
function _calculateHealthFactor(
    uint256 totalDscMinted,
    uint256 collateralValueInUsd
) internal pure returns (uint256);
```

#### 公式含义

协议先把抵押品按 liquidation ratio 做折算，再和债务比较。

当前实现中：

- `LIQUIDATION_RATIO = 50`
- `MINIMUM_HEALTH_FACTOR = 1e18`

可直观理解为：

> 用户仓位必须维持较高超额抵押，health factor 低于 1 就进入危险状态。

#### 特别情况

如果用户没有铸造任何 DSC：

- health factor 返回 `type(uint256).max`

也就是：

> 没有债务，就不存在爆仓风险。

---

## 6. 价格与预言机相关函数

### `getUsdValue`

```solidity
function getUsdValue(
    address collateralToken,
    uint256 collateralAmount
) public view returns (uint256 usdValue);
```

#### 作用

把某个抵押品数量转换成 USD 价值。

#### 用途

- 计算账户总抵押价值
- 参与 health factor 计算

---

### `getTokenAmountFromUsd`

```solidity
function getTokenAmountFromUsd(
    address collateralToken,
    uint256 usdAmountInWei
) public view returns (uint256 collateralAmount);
```

#### 作用

把 USD 数值反向换算成对应的抵押品数量。

#### 用途

- 清算时根据 `debtToCover` 计算要拿走多少抵押品

---

### `priceFeeds`

```solidity
function priceFeeds(address collateralToken) public view returns (address);
```

#### 作用

查询某种抵押品对应的 Chainlink Price Feed 地址。

---

## 7. 用户状态读取函数

### `getAccountInformation`

```solidity
function getAccountInformation(
    address user
) public view returns (uint256 totalDscMinted, uint256 collateralValueInUsd);
```

#### 作用

获取用户最核心的两个协议状态：

- 当前已铸造 DSC 数量
- 当前总抵押品美元价值

#### 前端常见用途

- Account Overview
- Risk Dashboard

---

### `getAccountCollateralValue`

```solidity
function getAccountCollateralValue(
    address user
) public view returns (uint256 totalCollateralValueInUsd);
```

#### 作用

返回用户所有抵押品的总 USD 价值。

---

### `getDscMintedAmount`

```solidity
function getDscMintedAmount(address user) public view returns (uint256);
```

#### 作用

返回用户当前协议层债务，也就是该用户总共铸造了多少 DSC。

注意：

- 这个值不是“钱包里还剩多少 DSC”
- 而是“该用户当前对协议还欠多少债”

---

### `getHealthFactor`

```solidity
function getHealthFactor(address user) public view returns (uint256);
```

#### 作用

返回用户当前健康因子。

#### 前端用途

- 展示用户是否安全
- 判断某用户是否可被清算

---

### `getCollateralBalanceOfUser`

```solidity
function getCollateralBalanceOfUser(
    address user,
    address collateralToken
) public view returns (uint256);
```

#### 作用

返回用户在协议里存入的某一种抵押品数量。

---

### `getTokenCollateralAddrList`

```solidity
function getTokenCollateralAddrList(uint256 index) public view returns (address);
```

#### 作用

按索引读取支持的抵押品列表。

当前协议支持：

- `WETH`
- `WBTC`

---

### `getMinHealthFactor`

```solidity
function getMinHealthFactor() external pure returns (uint256);
```

#### 作用

返回协议设定的最小健康因子阈值。

这个值可以作为前端判断：

- 当前仓位是否安全
- liquidation 是否有资格触发

---

## 8. `DecentralizedStableCoin` 主要函数说明

这个合约是 DSC 代币本体。

### `mint`

```solidity
function mint(
    address recipient,
    uint256 dscAmountToMint
) external returns (bool success);
```

#### 作用

给指定地址铸造新的 DSC。

#### 权限

- 只有 `owner` 可以调用
- 协议设计中，`owner` 应该是 `DSCEngine`

#### 参数

- `recipient`：接收 DSC 的地址
- `dscAmountToMint`：铸造数量

---

### `burn`

```solidity
function burn(uint256 dscAmountToBurn) public override;
```

#### 作用

销毁 owner 地址当前持有的 DSC。

#### 权限

- 只有 `owner` 可以调用
- 在协议架构里，实际调用者是 `DSCEngine`

#### 典型流程

1. 用户先把 DSC `transferFrom` 给 `DSCEngine`
2. `DSCEngine` 再调用 `DSC.burn()`

---

## 9. 前端如何对接这些接口

一般会分成两类：

### 读接口

前端常读：

- `getAccountInformation`
- `getAccountCollateralValue`
- `getDscMintedAmount`
- `getHealthFactor`
- `getCollateralBalanceOfUser`
- `getUsdValue`
- `getTokenAmountFromUsd`

### 写接口

前端常写：

- `depositCollateral`
- `depositCollateralAndMintDsc`
- `mintDsc`
- `burnDsc`
- `redeemCollateral`
- `redeemCollateralForDsc`
- `liquidate`

### ERC20 approve 流程

写协议前通常先 `approve`：

- 存抵押前：对 `WETH/WBTC` 执行 `approve(engine, amount)`
- burn / burn+redeem / liquidate 前：对 `DSC` 执行 `approve(engine, amount)`

---

## 10. 总结

1. 这是一个超额抵押稳定币协议
2. `DSC` 是币本体，`DSCEngine` 是规则引擎
3. 协议支持 WETH / WBTC 抵押
4. 通过预言机把抵押品换算成 USD
5. 用户可以 deposit / mint / burn / redeem
6. 协议通过 health factor 控制风险
7. 当 HF < 1 时，允许 liquidator 清算

一句话版本可以讲成：

> `DSCEngine` 负责协议规则和风险控制，`DecentralizedStableCoin` 负责稳定币本体，协议通过预言机定价、健康因子约束和清算机制形成完整的超额抵押稳定币闭环。

---

## 11. 当前实现的边界

这份接口文档描述的是当前项目中的 demo 级协议实现。
它已经能够很好地展示协议闭环，但和生产级稳定币协议相比，仍然有一些未覆盖点，比如：

- 预言机 stale price 校验
- round 数据有效性检查
- 更完整的多抵押品 decimals 兼容
- 更生产化的风控与异常处理

所以更准确的说法是：

> 这是一个用于学习、演示展示的最小稳定币协议实现，而不是直接可上线的生产级版本。

---
