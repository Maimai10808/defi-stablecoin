// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {DecentralizedStableCoin} from "../DecentralizedStableCoin.sol";
import {DSCEngineErrors} from "./DSCEngineErrors.sol";

/**
 * @title DSCEngineStorage
 * @notice DSC Engine 的底层存储合约
 * @dev 负责定义协议中通用的常量、状态变量、映射关系和基础 modifier。
 *      其他逻辑模块会继承该合约，从而共享同一套存储结构。
 */
abstract contract DSCEngineStorage is DSCEngineErrors {
    // Chainlink 价格预言机通常是 8 位精度，这里额外补 1e10，用于统一到 18 位精度
    uint256 internal constant ADDITIONAL_FEED_PRECISION_1e10 = 1e10;

    // 协议内部统一使用的 18 位精度
    uint256 internal constant PRECISION_1e18 = 1e18;

    // 清算阈值：抵押品价值按 50% 计算可支撑的债务
    // 例如 100 美元抵押品，最多按 50 美元有效抵押价值计算
    uint256 internal constant LIQUIDATION_RATIO_50 = 50;

    // 清算比例计算精度，配合 LIQUIDATION_RATIO_50 使用
    uint256 internal constant LIQUIDATION_PRECISION_100 = 100;

    // 最小健康因子，低于 1e18 表示账户抵押不足，可以被清算
    uint256 internal constant MINIMUM_HEALTH_FACTOR_1e18 = 1e18;

    // 清算奖励，清算人可以额外获得 10% 抵押品奖励
    uint256 internal constant LIQUIDATION_BONUS_10 = 10;

    // DSC 稳定币合约地址，部署后不可更改
    DecentralizedStableCoin internal immutable i_dsc;

    // 抵押品 Token 地址 => 对应的 Chainlink 价格预言机地址
    mapping(address collateralToken => address priceFeed) internal s_priceFeeds;

    // 用户地址 => 抵押品 Token 地址 => 用户存入的抵押品数量
    mapping(address user => mapping(address collateralToken => uint256 amount))
        internal s_collateralDeposited;

    // 用户地址 => 已经铸造的 DSC 数量
    mapping(address user => uint256 dscMinted) internal s_dscMinted;

    // 协议支持的所有抵押品 Token 地址列表
    address[] internal s_collateralTokens;

    /**
     * @notice 初始化 DSC 稳定币合约地址
     * @param dscAddress DecentralizedStableCoin 合约地址
     */
    constructor(address dscAddress) {
        i_dsc = DecentralizedStableCoin(dscAddress);
    }

    /**
     * @notice 限制传入金额必须大于 0
     * @param amount 需要校验的金额
     */
    modifier onlyAmountMoreThanZero(uint256 amount) {
        if (amount <= 0) {
            revert DSCEngine__AmountMustBeMoreThanZero();
        }
        _;
    }

    /**
     * @notice 限制抵押品必须是协议允许的 Token
     * @dev 如果该 Token 没有配置价格预言机，则认为不是允许的抵押品
     * @param collateralToken 抵押品 Token 地址
     */
    modifier onlyAllowedToken(address collateralToken) {
        if (s_priceFeeds[collateralToken] == address(0)) {
            revert DSCEngine__NotTheAllowedToken();
        }
        _;
    }
}
