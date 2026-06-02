# DeFi Stablecoin Foundry Contracts

## 核心功能

### DecentralizedStableCoin

`DecentralizedStableCoin` 是协议中的 ERC20 稳定币合约。

它具备以下特点：

- 基于 ERC20 标准；
- 支持 mint 和 burn；
- mint / burn 权限由 owner 控制；
- 在协议设计中，owner 应该是 `DSCEngine` 合约；
- 用户不能直接随意铸造 DSC，必须通过 DSCEngine 的抵押逻辑完成。

### DSCEngine

`DSCEngine` 是协议核心引擎，负责管理抵押品、铸造、赎回和清算。

主要功能包括：

- 存入抵押品：`depositCollateral`
- 存入抵押品并铸造 DSC：`depositCollateralAndMintDsc`
- 铸造 DSC：`mintDsc`
- 燃烧 DSC：`burnDsc`
- 赎回抵押品：`redeemCollateral`
- 燃烧 DSC 并赎回抵押品：`redeemCollateralForDsc`
- 清算不健康账户：`liquidate`
- 查询账户抵押价值、已铸造 DSC、Health Factor 等信息

## 安装依赖

进入 `foundry` 目录：

```bash
cd foundry
```

如果是第一次克隆项目，先安装 Foundry 依赖：

```bash
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2
forge install smartcontractkit/chainlink-brownie-contracts
```

然后创建或确认 `remappings.txt`：

```bash
cat > remappings.txt <<'EOF'
forge-std/=lib/forge-std/src/
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
@chainlink/contracts/=lib/chainlink-brownie-contracts/contracts/
EOF
```

> 注意：如果你的 Foundry 版本不支持 `--no-commit`，不要使用 `forge install xxx --no-commit`，直接使用上面的命令即可。

## 编译合约

```bash
forge clean
forge build
```

如果编译成功，会看到类似输出：

```txt
Compiler run successful
```

## 运行测试

```bash
forge test
```

如果需要查看更详细的测试日志：

```bash
forge test -vv
```

如果只想运行某一个测试文件：

```bash
forge test --match-path test/unit/DSCEngineTest.t.sol
```

如果只想运行某一个测试函数：

```bash
forge test --match-test testDepositCollateral_ShouldReverts_WhenAmountLessThanZero
```

## 本地开发网络

启动本地 Anvil 链：

```bash
anvil
```

如果项目中已有 Makefile 或根目录脚本，也可以从项目根目录启动：

```bash
npm run contracts:anvil
```

Anvil 默认会启动在：

```txt
http://127.0.0.1:8545
```

默认 Chain ID 通常是：

```txt
31337
```

## 环境变量

如果部署脚本需要读取私钥，请在 `foundry` 目录下创建 `.env` 文件：

```bash
cp .env.example .env
```

示例：

```env
PRIVATE_KEY=0xYourPrivateKey
RPC_URL=http://127.0.0.1:8545
```

本地 Anvil 测试时，可以使用 Anvil 输出的任意测试私钥。

> 注意：真实私钥不要提交到 GitHub。`.env` 必须加入 `.gitignore`。

## 部署合约

本地部署：

```bash
forge script script/DeployDSC.s.sol:DeployDSC \
  --rpc-url http://127.0.0.1:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```

如果项目中已经封装了 Makefile，可以使用：

```bash
make deploy
```

或者从项目根目录执行：

```bash
npm run contracts:deploy
```

如果项目已经配置了一键部署与前端同步命令，可以执行：

```bash
npm run contracts:deploy:all
```

该命令通常会完成：

1. 部署合约；
2. 同步合约地址到前端；
3. 重新生成前端 wagmi 类型文件。

## 测试目录说明

```txt
test/
├─ unit/
│  └─ DSCEngineTest.t.sol
├─ fuzz/
│  ├─ Handler.t.sol
│  └─ OpenInvariantsTest.t.sol
└─ mocks/
   ├─ MockV3Aggregator.sol
   ├─ MockFailedMintDSC.sol
   ├─ MockFailedTransfer.sol
   ├─ MockFailedTransferFrom.sol
   └─ MockMoreDebtDsc.sol
```

### unit

单元测试目录，主要测试 DSCEngine 的核心功能：

- 构造函数参数校验；
- 抵押品存入；
- DSC 铸造；
- DSC 燃烧；
- 抵押品赎回；
- Health Factor 校验；
- 清算逻辑；
- Getter 查询函数。

### fuzz

模糊测试目录，用于验证协议在随机输入下是否仍然满足核心约束。

例如：

- 抵押品价值换算是否合理；
- 存入抵押品后账户余额是否正确增加；
- 协议整体抵押价值是否始终大于等于 DSC 总供应量。

### mocks

Mock 合约目录，用于模拟特殊测试场景。

例如：

- `MockV3Aggregator`：模拟 Chainlink 价格预言机；
- `MockFailedMintDSC`：模拟 DSC mint 返回 false；
- `MockFailedTransfer`：模拟 ERC20 transfer 失败；
- `MockFailedTransferFrom`：模拟 ERC20 transferFrom 失败；
- `MockMoreDebtDsc`：模拟异常债务场景。

## 常见问题

### 1. 找不到 OpenZeppelin / Chainlink / forge-std

如果出现类似错误：

```txt
Source "forge-std/Test.sol" not found
Source "@openzeppelin/contracts/..." not found
Source "@chainlink/contracts/..." not found
```

说明 `lib/` 依赖没有安装或 remappings 配置不正确。

可以重新安装：

```bash
rm -rf lib/forge-std lib/openzeppelin-contracts lib/chainlink-brownie-contracts

forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2
forge install smartcontractkit/chainlink-brownie-contracts
```

然后重新写入 `remappings.txt`：

```bash
cat > remappings.txt <<'EOF'
forge-std/=lib/forge-std/src/
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
@chainlink/contracts/=lib/chainlink-brownie-contracts/contracts/
EOF
```

最后重新编译：

```bash
forge clean
forge build
```

### 2. `--no-commit` 报错

如果执行：

```bash
forge install xxx --no-commit
```

出现：

```txt
error: unexpected argument '--no-commit' found
```

说明当前 Foundry 版本不支持这个参数。

直接改成：

```bash
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2
forge install smartcontractkit/chainlink-brownie-contracts
```

### 3. `vm.writeJson` 找不到目录

如果测试时报错：

```txt
vm.writeJson: failed to open file ".../web/lib/contracts/addresses/31337.json": No such file or directory
```

说明部署脚本在测试过程中尝试写入前端地址文件，但目标目录不存在。

可以创建目录：

```bash
mkdir -p web/lib/contracts/addresses
```

然后重新运行：

```bash
forge test
```

### 4. `DSCEngine.DSCEngine__xxx.selector` 找不到

如果把错误拆到了 `DSCEngineErrors.sol`，测试中需要这样引用：

```solidity
import {DSCEngineErrors} from "../../src/engine/DSCEngineErrors.sol";
```

然后把：

```solidity
DSCEngine.DSCEngine__AmountMustBeMoreThanZero.selector
```

改成：

```solidity
DSCEngineErrors.DSCEngine__AmountMustBeMoreThanZero.selector
```

## 推荐开发流程

```bash
# 1. 安装依赖
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2
forge install smartcontractkit/chainlink-brownie-contracts

# 2. 编译
forge clean
forge build

# 3. 运行测试
forge test

# 4. 格式化代码
forge fmt

# 5. 启动本地链
anvil

# 6. 部署到本地链
forge script script/DeployDSC.s.sol:DeployDSC \
  --rpc-url http://127.0.0.1:8545 \
  --private-key $PRIVATE_KEY \
  --broadcast
```
