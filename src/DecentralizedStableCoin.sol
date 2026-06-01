// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {DecentralizedStableCoinValidation} from "./stablecoin/DecentralizedStableCoinValidation.sol";

/**
 * @title DecentralizedStableCoin
 * @author Maimai
 * @notice DSC protocol 中使用的 ERC20 稳定币合约
 * @dev 该合约本身只负责 Token 的 mint / burn 能力，
 *      具体的抵押、健康因子、清算和铸造条件判断由 DSCEngine 负责。
 *
 * 设计目标：
 * - 以美元为目标锚定价格
 * - 由外部加密资产超额抵押支持
 * - 由协议算法控制发行与销毁
 * - 只能由 DSCEngine 调用 mint / burn，避免用户绕过抵押逻辑直接增发
 */
contract DecentralizedStableCoin is
    ERC20Burnable,
    Ownable,
    DecentralizedStableCoinValidation
{
    /**
     * @notice 初始化 DSC Token 的名称、符号和合约所有者
     * @param initialOwner 初始 owner，预期为 DSCEngine 合约地址
     * @dev OpenZeppelin Ownable 的 owner 会被设置为 initialOwner。
     *      在本协议中，DSCEngine 应作为 owner，从而统一控制 DSC 的铸造和销毁。
     */
    constructor(
        address initialOwner
    ) ERC20("DecentralizedStableCoin", "DSC") Ownable(initialOwner) {}

    /**
     * @notice 销毁 DSC
     * @param dscAmountToBurn 需要销毁的 DSC 数量
     * @dev 只有 owner 可以调用。协议设计中，owner 应为 DSCEngine。
     *      burn 前会校验：
     *      1. 销毁数量必须大于 0
     *      2. 销毁数量不能超过调用者当前余额
     *
     * 注意：
     * ERC20Burnable 的 burn() 默认销毁 msg.sender 的余额。
     * 因此这里实际销毁的是 DSCEngine 当前持有的 DSC。
     * 通常 DSCEngine 会先通过 transferFrom 把用户 DSC 转入自身，
     * 再调用 burn() 完成销毁。
     */
    function burn(uint256 dscAmountToBurn) public override onlyOwner {
        _validateAmountMoreThanZero(dscAmountToBurn);
        _validateBurnAmountNotExceedsBalance(
            dscAmountToBurn,
            balanceOf(msg.sender)
        );

        super.burn(dscAmountToBurn);
    }

    /**
     * @notice 铸造 DSC 给指定用户
     * @param recipient 接收新铸造 DSC 的地址
     * @param dscAmountToMint 需要铸造的 DSC 数量
     * @return success 是否铸造成功
     * @dev 只有 owner 可以调用。协议设计中，owner 应为 DSCEngine。
     *      mint 前会校验：
     *      1. 接收地址不能是 address(0)
     *      2. 铸造数量必须大于 0
     *
     * 这里不直接检查抵押率和健康因子，
     * 因为这些协议层面的约束应由 DSCEngine 在调用 mint 前完成。
     */
    function mint(
        address recipient,
        uint256 dscAmountToMint
    ) external onlyOwner returns (bool success) {
        _validateNotZeroAddress(recipient);
        _validateAmountMoreThanZero(dscAmountToMint);

        _mint(recipient, dscAmountToMint);

        success = true;
    }
}
