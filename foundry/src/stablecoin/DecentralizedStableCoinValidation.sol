// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {DecentralizedStableCoinErrors} from "./DecentralizedStableCoinErrors.sol";

/**
 * @title DecentralizedStableCoinValidation
 * @notice 稳定币合约的通用校验逻辑模块
 * @dev 该合约继承 DecentralizedStableCoinErrors，
 *      将 mint、burn 等操作中常用的参数校验抽离出来，
 *      让主稳定币合约 DecentralizedStableCoin 的业务逻辑更简洁。
 */
abstract contract DecentralizedStableCoinValidation is
    DecentralizedStableCoinErrors
{
    /**
     * @notice 校验金额必须大于 0
     * @dev 用于 mint、burn 等需要传入金额的操作，
     *      防止用户传入 0 导致无意义操作。
     * @param amount 需要校验的金额
     */
    function _validateAmountMoreThanZero(uint256 amount) internal pure {
        if (amount == 0) {
            revert DecentralizedStableCoin__AmountMustBeMoreThanZero();
        }
    }

    /**
     * @notice 校验地址不能为零地址
     * @dev 主要用于 mint 场景，防止将稳定币铸造到 address(0)。
     * @param account 需要校验的账户地址
     */
    function _validateNotZeroAddress(address account) internal pure {
        if (account == address(0)) {
            revert DecentralizedStableCoin__NotZeroAddress();
        }
    }

    /**
     * @notice 校验销毁数量不能超过账户余额
     * @dev 用于 burn 操作，防止销毁数量大于当前账户实际持有的 DSC 数量。
     * @param burnAmount 计划销毁的 DSC 数量
     * @param accountBalance 当前账户的 DSC 余额
     */
    function _validateBurnAmountNotExceedsBalance(
        uint256 burnAmount,
        uint256 accountBalance
    ) internal pure {
        if (burnAmount > accountBalance) {
            revert DecentralizedStableCoin__BurnAmountExceedsBalance();
        }
    }
}
