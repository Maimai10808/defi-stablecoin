// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// 引入 ERC20 标准接口，用于调用 DSC 代币的 transferFrom 方法
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// 引入抵押品相关逻辑，当前合约继续在其基础上扩展 DSC 铸造 / 销毁逻辑
import {DSCEngineCollateralLogic} from "./DSCEngineCollateralLogic.sol";

/**
 * @title DSCEngineDscLogic
 * @notice DSC 稳定币相关的内部逻辑合约
 * @dev 该合约主要负责 DSC 的销毁逻辑，继承自 DSCEngineCollateralLogic
 */
abstract contract DSCEngineDscLogic is DSCEngineCollateralLogic {
    /**
     * @notice 构造函数，继续向父合约传递 DSC 稳定币地址
     * @param dscAddress DSC 稳定币合约地址
     */
    constructor(address dscAddress) DSCEngineCollateralLogic(dscAddress) {}

    /**
     * @notice 内部销毁 DSC 函数
     * @dev 先减少 onBehalfOf 用户的 DSC 铸造记录，再从 dscFrom 地址转入 DSC，最后销毁
     * @param dscAmountToBurn 要销毁的 DSC 数量
     * @param onBehalfOf 需要减少 DSC 债务记录的用户地址
     * @param dscFrom 实际提供 DSC 代币的地址
     */
    function _burnDsc(
        uint256 dscAmountToBurn,
        address onBehalfOf,
        address dscFrom
    ) internal {
        // 减少用户已经铸造的 DSC 数量，也就是减少该用户的债务记录
        s_dscMinted[onBehalfOf] -= dscAmountToBurn;

        // 将 DSC 从 dscFrom 地址转入当前协议合约
        // 注意：dscFrom 需要提前 approve 当前合约使用对应数量的 DSC
        bool success = IERC20(address(i_dsc)).transferFrom(
            dscFrom,
            address(this),
            dscAmountToBurn
        );

        // 如果 transferFrom 失败，则回滚交易
        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        // 销毁已经转入协议合约的 DSC
        i_dsc.burn(dscAmountToBurn);
    }
}
