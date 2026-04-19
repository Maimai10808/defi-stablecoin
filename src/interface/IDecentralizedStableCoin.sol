// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IDecentralizedStableCoin
 * @author Maimai
 * @notice Interface for the core DSC protocol engine.
 * @notice Defines the external actions available for collateralized borrowing,
 * repayment, redemption, and liquidation.
 * @dev This interface describes the protocol behavior implemented by DSCEngine.
 */
interface IDecentralizedStableCoin {
    /**
     * @param user The address of the user depositing collateral.
     * @param tokenCollateralAddr The address of the collateral token deposited.
     * @param amountCollateral The amount of collateral deposited.
     * @notice Emitted when collateral is deposited into the protocol.
     */
    event CollateralDeposited(
        address indexed user,
        address tokenCollateralAddr,
        uint256 amountCollateral
    );

    /**
     * @param from The address whose collateral balance is reduced.
     * @param to The address receiving the redeemed collateral.
     * @param tokenCollateralAddr The address of the collateral token redeemed.
     * @param amountCollateral The amount of collateral redeemed.
     * @notice Emitted when collateral is redeemed from the protocol.
     */
    event CollateralRedeemed(
        address indexed from,
        address indexed to,
        address tokenCollateralAddr,
        uint256 amountCollateral
    );

    /**
     * @param acceptedToken The address of the collateral token to deposit.
     * @param amountCollateral The amount of collateral to deposit.
     * @param amountToMint The amount of DSC to mint.
     * @notice Deposits collateral and mints DSC in a single transaction.
     */
    function depositCollateralAndMintDsc(
        address acceptedToken,
        uint256 amountCollateral,
        uint256 amountToMint
    ) external;

    /**
     * @param tokenCollateralAddr The address of the collateral token to deposit.
     * @param amountCollateral The amount of collateral to deposit.
     * @notice Deposits collateral into the protocol.
     */
    function depositCollateral(
        address tokenCollateralAddr,
        uint256 amountCollateral
    ) external;

    /**
     * @param expectedToken The address of the collateral token to redeem.
     * @param expectedCollateralAmount The amount of collateral to redeem.
     * @param amountToBurn The amount of DSC to burn.
     * @notice Burns DSC and redeems collateral in a single transaction.
     */
    function redeemCollateralForDsc(
        address expectedToken,
        uint256 expectedCollateralAmount,
        uint256 amountToBurn
    ) external;

    /**
     * @param expectedToken The address of the collateral token to redeem.
     * @param expectedCollateralAmount The amount of collateral to redeem.
     * @notice Redeems collateral from the protocol.
     */
    function redeemCollateral(
        address expectedToken,
        uint256 expectedCollateralAmount
    ) external;

    /**
     * @param amountToMint The amount of DSC to mint.
     * @notice Mints DSC against the caller's deposited collateral.
     * @dev The caller must remain above the protocol's minimum health factor after minting.
     */
    function mintDsc(uint256 amountToMint) external;

    /**
     * @param amountToBurn The amount of DSC to burn.
     * @notice Burns DSC and reduces the caller's outstanding debt.
     */
    function burnDsc(uint256 amountToBurn) external;

    /**
     * @param collateral The address of the collateral token to seize.
     * @param liquidatedUser The address of the unhealthy position being liquidated.
     * @param debtToCover The amount of DSC debt the liquidator wants to repay.
     * @notice Liquidates an undercollateralized user position.
     * @dev The liquidator covers part of the user's debt and receives collateral plus a liquidation bonus.
     */
    function liquidate(
        address collateral,
        address liquidatedUser,
        uint256 debtToCover
    ) external;
}
