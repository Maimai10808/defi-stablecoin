// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// 引入 ERC20 标准接口，用于调用 collateralToken 的 transfer 方法
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// 引入健康因子相关逻辑，当前合约继承它，从而可以访问抵押记录、事件等状态和逻辑
import {DSCEngineHealthLogic} from "./DSCEngineHealthLogic.sol";

/**
 * @title DSCEngineCollateralLogic
 * @notice 抵押品相关的内部逻辑合约
 * @dev 该合约主要负责抵押品赎回逻辑，继承自 DSCEngineHealthLogic
 */
abstract contract DSCEngineCollateralLogic is DSCEngineHealthLogic {
    /**
     * @notice 构造函数，继续向父合约传递 DSC 稳定币地址
     * @param dscAddress DSC 稳定币合约地址
     */
    constructor(address dscAddress) DSCEngineHealthLogic(dscAddress) {}

    /**
     * @notice 内部赎回抵押品函数
     * @dev 从 from 用户的抵押记录中扣除 collateralAmount，并将对应 ERC20 抵押物转给 to
     * @param collateralToken 抵押品代币地址，例如 WETH / WBTC
     * @param collateralAmount 要赎回的抵押品数量
     * @param from 抵押记录被扣减的用户地址
     * @param to 实际接收抵押品的地址
     * @return success ERC20 转账是否成功
     */
    function _redeemCollateral(
        address collateralToken,
        uint256 collateralAmount,
        address from,
        address to
    ) internal returns (bool success) {
        // 先从用户的抵押记录中扣除对应数量的抵押品
        s_collateralDeposited[from][collateralToken] -= collateralAmount;

        // 触发抵押品赎回事件，方便前端或链上数据服务监听
        emit CollateralRedeemed(from, to, collateralToken, collateralAmount);

        // 将抵押品 ERC20 代币从合约转给接收地址
        success = IERC20(collateralToken).transfer(to, collateralAmount);
    }
}
