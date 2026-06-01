// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {DSCEnginePriceLogic} from "./DSCEnginePriceLogic.sol";

/**
 * @title DSCEngineHealthLogic
 * @notice 负责 DSC 协议中的健康因子计算与校验逻辑
 * @dev 继承价格逻辑模块，用于获取用户抵押品的美元价值
 */
abstract contract DSCEngineHealthLogic is DSCEnginePriceLogic {
    constructor(address dscAddress) DSCEnginePriceLogic(dscAddress) {}

    /**
     * @notice 获取用户账户的核心债务与抵押信息
     * @param user 用户地址
     * @return totalDscMinted 用户已经铸造的 DSC 数量
     * @return collateralValueInUsd 用户抵押品折算后的美元价值
     */
    function _getAccountInformation(
        address user
    )
        internal
        view
        returns (uint256 totalDscMinted, uint256 collateralValueInUsd)
    {
        totalDscMinted = s_dscMinted[user];
        collateralValueInUsd = getAccountCollateralValue(user);
    }

    /**
     * @notice 检查用户健康因子是否低于最低要求
     * @dev 如果健康因子小于 MINIMUM_HEALTH_FACTOR_1e18，则说明抵押不足，直接回滚
     * @param user 需要检查的用户地址
     */
    function _revertIfHealthFactorIsBroken(address user) internal view {
        uint256 userHealthFactor = _healthFactor(user);

        if (userHealthFactor < MINIMUM_HEALTH_FACTOR_1e18) {
            revert DSCEngine__HealthFactorIsBroken(userHealthFactor);
        }
    }

    /**
     * @notice 计算指定用户当前的健康因子
     * @param user 用户地址
     * @return userHealthFactor 用户当前健康因子，按 1e18 精度表示
     */
    function _healthFactor(
        address user
    ) internal view returns (uint256 userHealthFactor) {
        (
            uint256 totalDscMinted,
            uint256 collateralValueInUsd
        ) = _getAccountInformation(user);

        userHealthFactor = _calculateHealthFactor(
            totalDscMinted,
            collateralValueInUsd
        );
    }

    /**
     * @notice 根据用户债务和抵押品价值计算健康因子
     * @dev 健康因子越高，说明账户越安全；低于最低值时可能被清算
     * @param totalDscMinted 用户已经铸造的 DSC 数量
     * @param collateralValueInUsd 用户抵押品的美元价值
     * @return userHealthFactor 计算得到的健康因子，按 1e18 精度表示
     */
    function _calculateHealthFactor(
        uint256 totalDscMinted,
        uint256 collateralValueInUsd
    ) internal pure returns (uint256 userHealthFactor) {
        // 如果用户没有铸造 DSC，则没有债务，健康因子视为最大值
        if (totalDscMinted == 0) return type(uint256).max;

        // 按清算阈值折算有效抵押价值
        // 例如抵押价值为 100 USD，清算率为 50%，则有效抵押价值为 50 USD
        uint256 collateralAdjustedForThreshold = (collateralValueInUsd *
            LIQUIDATION_RATIO_50) / LIQUIDATION_PRECISION_100;

        // 健康因子 = 有效抵押价值 / 已铸造 DSC
        // 乘以 PRECISION_1e18 是为了保留 18 位精度
        userHealthFactor =
            (collateralAdjustedForThreshold * PRECISION_1e18) /
            totalDscMinted;
    }
}
