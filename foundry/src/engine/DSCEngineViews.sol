// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {DSCEngineDscLogic} from "./DSCEngineDscLogic.sol";

/**
 * @title DSCEngineViews
 * @notice DSC Engine 的只读查询模块
 * @dev 该合约不修改任何状态，只负责暴露协议中的核心状态数据，
 *      方便前端、测试脚本或外部调用者查询抵押品、价格源、DSC 地址、
 *      用户铸造数量和健康因子等信息。
 */
abstract contract DSCEngineViews is DSCEngineDscLogic {
    constructor(address dscAddress) DSCEngineDscLogic(dscAddress) {}

    /**
     * @notice 查询某个抵押品 Token 对应的价格预言机地址
     * @param collateralToken 抵押品 Token 地址
     * @return priceFeed 对应的 Chainlink 价格预言机地址
     */
    function priceFeeds(
        address collateralToken
    ) public view returns (address priceFeed) {
        priceFeed = s_priceFeeds[collateralToken];
    }

    /**
     * @notice 查询 DSC 稳定币合约地址
     * @return dscAddress DSC 合约地址
     */
    function dsc() public view returns (address dscAddress) {
        dscAddress = address(i_dsc);
    }

    /**
     * @notice 根据索引查询协议支持的抵押品 Token 地址
     * @param index 抵押品 Token 列表中的索引
     * @return collateralToken 抵押品 Token 地址
     */
    function getTokenCollateralAddrList(
        uint256 index
    ) public view returns (address collateralToken) {
        collateralToken = s_collateralTokens[index];
    }

    /**
     * @notice 查询用户账户的整体信息
     * @param user 用户地址
     * @return totalDscMinted 用户已经铸造的 DSC 总数量
     * @return collateralValueInUsd 用户抵押品的美元总价值
     */
    function getAccountInformation(
        address user
    )
        public
        view
        returns (uint256 totalDscMinted, uint256 collateralValueInUsd)
    {
        (totalDscMinted, collateralValueInUsd) = _getAccountInformation(user);
    }

    /**
     * @notice 查询用户已经铸造的 DSC 数量
     * @param user 用户地址
     * @return dscMinted 用户已铸造的 DSC 数量
     */
    function getDscMintedAmount(
        address user
    ) public view returns (uint256 dscMinted) {
        dscMinted = s_dscMinted[user];
    }

    /**
     * @notice 查询用户当前健康因子
     * @dev 健康因子越高，说明账户抵押越安全；
     *      如果低于最小健康因子，则账户可能被清算。
     * @param user 用户地址
     * @return healthFactor 用户当前健康因子
     */
    function getHealthFactor(
        address user
    ) public view returns (uint256 healthFactor) {
        healthFactor = _healthFactor(user);
    }

    /**
     * @notice 查询协议要求的最小健康因子
     * @return minimumHealthFactor 最小健康因子，默认是 1e18
     */
    function getMinHealthFactor()
        external
        pure
        returns (uint256 minimumHealthFactor)
    {
        minimumHealthFactor = MINIMUM_HEALTH_FACTOR_1e18;
    }

    /**
     * @notice 查询用户某种抵押品的存入数量
     * @param user 用户地址
     * @param collateralToken 抵押品 Token 地址
     * @return collateralAmount 用户存入的该抵押品数量
     */
    function getCollateralBalanceOfUser(
        address user,
        address collateralToken
    ) public view returns (uint256 collateralAmount) {
        collateralAmount = s_collateralDeposited[user][collateralToken];
    }
}
