// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title DSCEngineErrors
 * @notice DSCEngine 协议中统一使用的自定义错误定义
 * @dev 使用 custom error 可以比 require 字符串更节省 gas
 */
abstract contract DSCEngineErrors {
    /**
     * @notice 输入金额必须大于 0
     * @dev 常用于 deposit、mint、burn、redeem 等涉及金额的操作校验
     */
    error DSCEngine__AmountMustBeMoreThanZero();

    /**
     * @notice 当前代币不是协议允许的抵押品代币
     * @dev 用户只能存入白名单中的抵押资产
     */
    error DSCEngine__NotTheAllowedToken();

    /**
     * @notice 传入的地址数组和价格源数组长度不一致
     * @dev 常用于构造函数初始化抵押品代币和价格预言机时的参数校验
     */
    error DSCEngine__TheAddressListLengthNotMatch();

    /**
     * @notice ERC20 transferFrom 调用失败
     * @dev 常见原因包括未授权 approve、余额不足或代币转账失败
     */
    error DSCEngine_TransferFromFailed();

    /**
     * @notice 用户健康因子低于协议要求，操作会破坏抵押率
     * @param userHealthFactor 当前用户的健康因子
     */
    error DSCEngine__HealthFactorIsBroken(uint256 userHealthFactor);

    /**
     * @notice DSC 铸造失败
     * @dev 通常发生在调用 DSC mint 失败时
     */
    error DSCEngine__MintFailed();

    /**
     * @notice 用户健康因子仍然安全，不能被清算
     * @param userHealthFactor 当前用户的健康因子
     */
    error DSCEngine__HealthFactorIsSafe(uint256 userHealthFactor);

    /**
     * @notice 清算后用户健康因子没有改善
     * @dev 用于防止无效清算或使系统状态变差的清算行为
     */
    error DSCEngine__HealthFactorNotImproved();
}
