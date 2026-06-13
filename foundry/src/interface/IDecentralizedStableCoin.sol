// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IDecentralizedStableCoin
 * @author Maimai
 * @notice DSC 协议核心引擎接口
 * @notice 定义用户与稳定币协议交互时可调用的外部方法，
 *         包括抵押、铸造、偿还、赎回和清算。
 * @dev 该接口由 DSCEngine 实现，用于规范协议核心行为。
 */
interface IDecentralizedStableCoin {
    /**
     * @notice 用户向协议存入抵押资产时触发
     * @param user 存入抵押品的用户地址
     * @param collateralToken 抵押资产的 ERC20 Token 地址
     * @param collateralAmount 存入的抵押资产数量
     */
    event CollateralDeposited(
        address indexed user,
        address collateralToken,
        uint256 collateralAmount
    );

    /**
     * @notice 用户从协议赎回抵押资产时触发
     * @param from 抵押余额被扣减的用户地址
     * @param to 接收抵押资产的地址
     * @param collateralToken 被赎回的抵押资产地址
     * @param collateralAmount 赎回的抵押资产数量
     */
    event CollateralRedeemed(
        address indexed from,
        address indexed to,
        address collateralToken,
        uint256 collateralAmount
    );

    /**
     * @notice 在一笔交易中完成“存入抵押品 + 铸造 DSC”
     * @dev 用户先存入指定抵押资产，再根据抵押价值铸造稳定币。
     *      执行后用户健康因子必须满足协议要求。
     * @param collateralToken 抵押资产地址
     * @param collateralAmount 存入的抵押资产数量
     * @param dscAmountToMint 需要铸造的 DSC 数量
     */
    function depositCollateralAndMintDsc(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToMint
    ) external;

    function depositCollateralAndMintDscWithPermit(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToMint,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice 向协议单独存入抵押资产
     * @dev 该方法只增加用户抵押品余额，不会铸造 DSC。
     * @param collateralToken 抵押资产地址
     * @param collateralAmount 存入的抵押资产数量
     */
    function depositCollateral(
        address collateralToken,
        uint256 collateralAmount
    ) external;

    function depositCollateralWithPermit(
        address collateralToken,
        uint256 collateralAmount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice 在一笔交易中完成“销毁 DSC + 赎回抵押品”
     * @dev 用户通过偿还部分 DSC 债务，降低负债后赎回对应抵押资产。
     *      执行后用户健康因子仍需满足协议要求。
     * @param collateralToken 需要赎回的抵押资产地址
     * @param collateralAmount 需要赎回的抵押资产数量
     * @param dscAmountToBurn 需要销毁的 DSC 数量
     */
    function redeemCollateralForDsc(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToBurn
    ) external;

    /**
     * @notice 单独赎回抵押资产
     * @dev 用户赎回抵押品后，账户健康因子不能低于协议最低要求。
     * @param collateralToken 需要赎回的抵押资产地址
     * @param collateralAmount 需要赎回的抵押资产数量
     */
    function redeemCollateral(
        address collateralToken,
        uint256 collateralAmount
    ) external;

    /**
     * @notice 基于已存入的抵押资产铸造 DSC
     * @dev 铸造后用户的健康因子必须不低于最小健康因子，
     *      否则交易会回滚。
     * @param dscAmountToMint 需要铸造的 DSC 数量
     */
    function mintDsc(uint256 dscAmountToMint) external;

    /**
     * @notice 销毁 DSC 并减少用户债务
     * @dev 用户偿还 DSC 后，协议中记录的已铸造债务会相应减少。
     * @param dscAmountToBurn 需要销毁的 DSC 数量
     */
    function burnDsc(uint256 dscAmountToBurn) external;

    function repayDscWithPermit(
        uint256 dscAmountToBurn,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    /**
     * @notice 清算健康因子不足的用户仓位
     * @dev 清算人代替被清算用户偿还部分 DSC 债务，
     *      并获得对应抵押品及额外清算奖励。
     * @param collateralToken 清算时要获取的抵押资产地址
     * @param userToLiquidate 被清算用户地址
     * @param debtToCover 清算人愿意代偿的 DSC 债务数量
     */
    function liquidate(
        address collateralToken,
        address userToLiquidate,
        uint256 debtToCover
    ) external;
}
