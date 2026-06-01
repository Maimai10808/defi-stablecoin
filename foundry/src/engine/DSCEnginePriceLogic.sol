// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import {DSCEngineStorage} from "./DSCEngineStorage.sol";

/**
 * @title DSCEnginePriceLogic
 * @notice 负责 DSC 协议中的价格换算与抵押品估值逻辑
 * @dev 通过 Chainlink Price Feed 获取抵押品价格，并统一换算为 18 位精度
 */
abstract contract DSCEnginePriceLogic is DSCEngineStorage {
    constructor(address dscAddress) DSCEngineStorage(dscAddress) {}

    /**
     * @notice 根据 USD 金额计算需要多少抵押品
     * @dev 常用于根据想要铸造的 DSC 数量，反推出需要的抵押品数量
     * @param collateralToken 抵押品 Token 地址
     * @param usdAmountInWei USD 金额，按 1e18 精度表示
     * @return collateralAmount 对应的抵押品数量
     */
    function getTokenAmountFromUsd(
        address collateralToken,
        uint256 usdAmountInWei
    ) public view returns (uint256 collateralAmount) {
        // 根据抵押品地址获取对应的 Chainlink 价格预言机
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeeds[collateralToken]
        );

        // 读取最新价格
        // Chainlink 返回的 price 通常是 8 位精度，例如 ETH/USD = 2000 * 1e8
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // collateralAmount = USD 金额 / Token 单价
        // 这里通过 PRECISION_1e18 和 ADDITIONAL_FEED_PRECISION_1e10 统一精度
        collateralAmount =
            (usdAmountInWei * PRECISION_1e18) /
            uint256(price) /
            ADDITIONAL_FEED_PRECISION_1e10;
    }

    /**
     * @notice 根据抵押品数量计算其 USD 价值
     * @param collateralToken 抵押品 Token 地址
     * @param collateralAmount 抵押品数量，按 Token 自身精度表示
     * @return usdValue 抵押品对应的 USD 价值，按 1e18 精度表示
     */
    function getUsdValue(
        address collateralToken,
        uint256 collateralAmount
    ) public view returns (uint256 usdValue) {
        // 获取抵押品对应的 Chainlink 价格预言机
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeeds[collateralToken]
        );

        // 读取最新价格
        (, int256 price, , , ) = priceFeed.latestRoundData();

        // usdValue = Token 价格 * Token 数量
        // price 通常是 8 位精度，ADDITIONAL_FEED_PRECISION_1e10 用于补齐到 18 位精度
        usdValue =
            (uint256(price) *
                ADDITIONAL_FEED_PRECISION_1e10 *
                collateralAmount) /
            PRECISION_1e18;
    }

    /**
     * @notice 计算用户所有抵押品的总 USD 价值
     * @dev 遍历协议支持的所有抵押品 Token，并累加用户对应抵押数量的美元价值
     * @param user 用户地址
     * @return totalCollateralValueInUsd 用户总抵押价值，按 1e18 精度表示
     */
    function getAccountCollateralValue(
        address user
    ) public view returns (uint256 totalCollateralValueInUsd) {
        // 遍历协议支持的所有抵押品
        for (uint256 i = 0; i < s_collateralTokens.length; i++) {
            address collateralToken = s_collateralTokens[i];

            // 获取用户在该抵押品上的存入数量
            uint256 collateralAmount = s_collateralDeposited[user][
                collateralToken
            ];

            // 将该抵押品数量换算成 USD，并累加到总抵押价值中
            totalCollateralValueInUsd += getUsdValue(
                collateralToken,
                collateralAmount
            );
        }
    }
}
