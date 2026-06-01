// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title DecentralizedStableCoinErrors
 * @notice 稳定币合约的自定义错误定义
 * @dev 使用 custom error 比 require 字符串更节省 gas，
 *      也方便统一管理合约中的错误类型。
 */
abstract contract DecentralizedStableCoinErrors {
    /**
     * @notice 当输入金额为 0 时回滚
     * @dev 主要用于 mint、burn 等需要校验金额的场景。
     */
    error DecentralizedStableCoin__AmountMustBeMoreThanZero();

    /**
     * @notice 当销毁数量超过账户余额时回滚
     * @dev 防止销毁超过当前账户实际持有的 DSC 数量。
     */
    error DecentralizedStableCoin__BurnAmountExceedsBalance();

    /**
     * @notice 当传入零地址时回滚
     * @dev 主要用于防止向 address(0) 铸造稳定币。
     */
    error DecentralizedStableCoin__NotZeroAddress();
}
