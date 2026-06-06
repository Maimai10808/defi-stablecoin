// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IDecentralizedStableCoin} from "./interface/IDecentralizedStableCoin.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {DSCEngineViews} from "./engine/DSCEngineViews.sol";

/**
 * @title DSCEngine
 * @author Maimai
 *
 * @notice
 * DSCEngine 是这个去中心化稳定币协议的核心合约。
 *
 * 可以把它理解成一个“链上的抵押借币系统”：
 * 用户先把 WETH、WBTC 这类有价值的加密资产存进合约作为抵押物，
 * 然后系统根据抵押物的美元价值，允许用户铸造一定数量的 DSC 稳定币。
 *
 * DSC 是本项目中的稳定币，目标价格是 1 DSC ≈ 1 USD。
 * 但 DSC 不是由银行账户里的美元支持，而是由用户存入合约的加密资产超额抵押支持。
 *
 * 举个简单例子：
 * - 用户存入价值 1000 美元的 WETH；
 * - 协议不会允许他铸造 1000 个 DSC，而是只允许铸造更少数量；
 * - 这样即使抵押物价格下跌，系统也还有安全缓冲。
 *
 * 本合约主要负责五件事：
 * 1. depositCollateral：用户存入抵押物；
 * 2. mintDsc：用户根据抵押物价值铸造 DSC；
 * 3. burnDsc：用户销毁 DSC，减少自己的债务；
 * 4. redeemCollateral：用户赎回自己的抵押物；
 * 5. liquidate：当某个用户仓位不健康时，允许其他人清算该仓位。
 *
 * 协议中最核心的风险控制指标是 Health Factor，中文可以理解为“健康因子”。
 * 健康因子越高，说明用户抵押物越充足，仓位越安全；
 * 健康因子过低，说明用户借出的 DSC 太多，或者抵押物价值下跌，仓位可能被清算。
 *
 * @dev
 * 本项目是一个简化版 MakerDAO / Aave 风格的超额抵押稳定币协议 Demo。
 *
 * 它保留了 DeFi 稳定币协议中最核心的闭环：
 * 抵押资产 -> 计算美元价值 -> 铸造稳定币 -> 检查健康因子 -> 偿还/赎回/清算。
 *
 * 本项目为了学习和演示，做了以下简化：
 * - 不包含治理模块；
 * - 不收取稳定费；
 * - 抵押物范围有限，例如 WETH / WBTC；
 * - 价格通过 Chainlink Price Feed 或本地 Mock Price Feed 获取；
 * - 本地开发环境中使用 Foundry、Anvil、Mock Token 和前端面板进行完整交互演示。
 *
 * 协议目标：
 * - 让 DSC 尽量保持 1 美元锚定；
 * - 要求用户超额抵押，避免系统资不抵债；
 * - 通过健康因子限制过度借贷；
 * - 通过清算机制处理风险仓位；
 * - 通过前端面板展示完整的 deposit / mint / burn / redeem / liquidation 流程。
 */

/**
 * @title DSCEngine
 * @author Maimai
 * @notice DSC 稳定币协议的核心引擎合约
 * @dev 该合约负责协议的主要业务逻辑，包括：
 *      1. 用户抵押资产
 *      2. 用户铸造 DSC
 *      3. 用户销毁 DSC
 *      4. 用户赎回抵押物
 *      5. 清算不健康仓位
 *
 * 协议设计目标：
 * - 外部加密资产超额抵押
 * - DSC 目标价格锚定 1 USD
 * - 通过健康因子限制用户债务风险
 * - 通过清算机制维护系统偿付能力
 *
 * 简化版 MakerDAO 设计：
 * - 无治理模块
 * - 无稳定费
 * - 抵押资产范围有限，例如 WETH / WBTC
 */
contract DSCEngine is
    IDecentralizedStableCoin,
    ReentrancyGuard,
    DSCEngineViews
{
    /**
     * @notice 初始化 DSCEngine
     * @param collateralTokens 允许作为抵押品的 Token 地址列表
     * @param priceFeedAddresses 每个抵押 Token 对应的 Chainlink 价格预言机地址
     * @param dscAddress DSC 稳定币合约地址
     * @dev collateralTokens 和 priceFeedAddresses 必须一一对应。
     *      例如：
     *      collateralTokens[0] = WETH
     *      priceFeedAddresses[0] = ETH / USD price feed
     */
    constructor(
        address[] memory collateralTokens,
        address[] memory priceFeedAddresses,
        address dscAddress
    ) DSCEngineViews(dscAddress) {
        if (collateralTokens.length != priceFeedAddresses.length) {
            revert DSCEngine__TheAddressListLengthNotMatch();
        }

        s_collateralTokens = collateralTokens;

        for (uint256 i = 0; i < collateralTokens.length; i++) {
            s_priceFeeds[collateralTokens[i]] = priceFeedAddresses[i];
        }
    }

    /**
     * @notice 存入抵押资产
     * @param collateralToken 抵押 Token 地址
     * @param collateralAmount 抵押数量
     * @dev 用户需要先 approve DSCEngine，合约才能 transferFrom 用户的 Token。
     *      该函数只负责存入抵押物，不会自动铸造 DSC。
     *
     * 安全限制：
     * - 抵押数量必须大于 0
     * - 抵押 Token 必须是协议允许的 Token
     * - 使用 nonReentrant 防止重入攻击
     */
    function depositCollateral(
        address collateralToken,
        uint256 collateralAmount
    )
        public
        override
        onlyAmountMoreThanZero(collateralAmount)
        onlyAllowedToken(collateralToken)
        nonReentrant
    {
        s_collateralDeposited[msg.sender][collateralToken] += collateralAmount;

        emit CollateralDeposited(msg.sender, collateralToken, collateralAmount);

        bool success = IERC20(collateralToken).transferFrom(
            msg.sender,
            address(this),
            collateralAmount
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }
    }

    /**
     * @notice 存入抵押物并同时铸造 DSC
     * @param collateralToken 抵押 Token 地址
     * @param collateralAmount 抵押数量
     * @param dscAmountToMint 想要铸造的 DSC 数量
     * @dev 这是一个组合操作：
     *      1. 先存入抵押物
     *      2. 再根据健康因子限制铸造 DSC
     */
    function depositCollateralAndMintDsc(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToMint
    ) public override {
        depositCollateral(collateralToken, collateralAmount);
        mintDsc(dscAmountToMint);
    }

    /**
     * @notice 铸造 DSC
     * @param dscAmountToMint 需要铸造的 DSC 数量
     * @dev 铸造前会先增加用户债务记录，然后检查健康因子。
     *      如果铸造后健康因子低于最低要求，交易会回滚。
     *
     * 这里的核心约束是：
     * 用户不能铸造超过其抵押物价值所支持的 DSC。
     */
    function mintDsc(uint256 dscAmountToMint) public override {
        s_dscMinted[msg.sender] += dscAmountToMint;

        _revertIfHealthFactorIsBroken(msg.sender);

        bool success = i_dsc.mint(msg.sender, dscAmountToMint);

        if (!success) {
            revert DSCEngine__MintFailed();
        }
    }

    /**
     * @notice 销毁 DSC
     * @param dscAmountToBurn 需要销毁的 DSC 数量
     * @dev 用户需要先 approve DSCEngine，合约才能从用户账户转入 DSC 并销毁。
     *      销毁 DSC 会降低用户债务，通常会提升健康因子。
     */
    function burnDsc(
        uint256 dscAmountToBurn
    ) public override onlyAmountMoreThanZero(dscAmountToBurn) {
        _burnDsc(dscAmountToBurn, msg.sender, msg.sender);
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @notice 赎回抵押物
     * @param collateralToken 要赎回的抵押 Token 地址
     * @param collateralAmount 要赎回的抵押数量
     * @dev 赎回抵押物会降低用户抵押价值，因此赎回后必须重新检查健康因子。
     *      如果赎回后用户仓位不健康，交易会回滚。
     */
    function redeemCollateral(
        address collateralToken,
        uint256 collateralAmount
    ) public override onlyAmountMoreThanZero(collateralAmount) nonReentrant {
        bool success = _redeemCollateral(
            collateralToken,
            collateralAmount,
            msg.sender,
            msg.sender
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @notice 销毁 DSC 并赎回抵押物
     * @param collateralToken 要赎回的抵押 Token 地址
     * @param collateralAmount 要赎回的抵押数量
     * @param dscAmountToBurn 需要先销毁的 DSC 数量
     * @dev 这是一个组合操作：
     *      1. 先销毁 DSC，降低债务
     *      2. 再赎回抵押物
     *      3. 最后检查健康因子
     */
    function redeemCollateralForDsc(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToBurn
    ) public override {
        burnDsc(dscAmountToBurn);

        bool success = _redeemCollateral(
            collateralToken,
            collateralAmount,
            msg.sender,
            msg.sender
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @notice 清算不健康用户的仓位
     * @param collateralToken 清算人希望获得的抵押 Token 地址
     * @param userToLiquidate 被清算用户地址
     * @param debtToCover 清算人愿意替用户偿还的 DSC 债务数量
     * @dev 当用户健康因子低于最低值时，其他人可以替该用户偿还部分 DSC 债务，
     *      并获得等值抵押物以及额外清算奖励。
     *
     * 清算流程：
     * 1. 检查被清算用户的健康因子是否低于最低要求
     * 2. 根据 debtToCover 计算可获得的抵押物数量
     * 3. 额外计算清算奖励 bonusCollateral
     * 4. 将抵押物从被清算用户转给清算人
     * 5. 从清算人账户转入 DSC 并销毁，用于偿还被清算用户债务
     * 6. 检查被清算用户健康因子是否得到改善
     * 7. 检查清算人自身健康因子是否仍然安全
     */
    function liquidate(
        address collateralToken,
        address userToLiquidate,
        uint256 debtToCover
    ) public override onlyAmountMoreThanZero(debtToCover) nonReentrant {
        uint256 startingUserHealthFactor = _healthFactor(userToLiquidate);

        if (startingUserHealthFactor >= MINIMUM_HEALTH_FACTOR_1e18) {
            revert DSCEngine__HealthFactorIsSafe(startingUserHealthFactor);
        }

        uint256 collateralAmountFromDebtCovered = getTokenAmountFromUsd(
            collateralToken,
            debtToCover
        );

        uint256 bonusCollateral = (collateralAmountFromDebtCovered *
            LIQUIDATION_BONUS_10) / LIQUIDATION_PRECISION_100;

        uint256 totalCollateralToRedeem = collateralAmountFromDebtCovered +
            bonusCollateral;

        bool success = _redeemCollateral(
            collateralToken,
            totalCollateralToRedeem,
            userToLiquidate,
            msg.sender
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        _burnDsc(debtToCover, userToLiquidate, msg.sender);

        uint256 endingUserHealthFactor = _healthFactor(userToLiquidate);

        if (endingUserHealthFactor <= startingUserHealthFactor) {
            revert DSCEngine__HealthFactorNotImproved();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }
}
