// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IDecentralizedStableCoin} from "./interface/IDecentralizedStableCoin.sol";
import {DecentralizedStableCoin} from "./DecentralizedStableCoin.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title DSCEngine
 * @author Maimai
 * @notice Core engine for the Decentralized StableCoin (DSC) protocol.
 * @notice The system is designed to be minimal and aims to maintain a 1 DSC = 1 USD peg.
 * @dev This stablecoin system is:
 * - Exogenously collateralized
 * - Dollar pegged
 * - Algorithmically stabilized
 *
 * The design is conceptually similar to MakerDAO's DSS, but simplified:
 * - no governance
 * - no stability fees
 * - collateral limited to WETH and WBTC
 *
 * This contract is responsible for:
 * - accepting collateral deposits
 * - minting DSC against collateral
 * - burning DSC
 * - redeeming collateral
 * - liquidating unhealthy positions
 */
contract DSCEngine is IDecentralizedStableCoin, ReentrancyGuard {
    // ============
    //    Errors
    // ============

    error DSCEngine__AmountMustBeMoreThanZero();
    error DSCEngine__NotTheAllowedToken();
    error DSCEngine__TheAddressListLengthNotMatch();
    error DSCEngine_TransferFromFailed();
    error DSCEngine__HealthFactorIsBroken(uint256 userHealthFactor);
    error DSCEngine__MintFailed();
    error DSCEngine__HealthFactorIsSafe(uint256 userHealthFactor);
    error DSCEngine__HealthFactorNotImproved();

    // =========================
    //   Constants / Immutables
    // =========================

    uint256 private constant ADDITIONAL_FEED_PRECISION_1e10 = 1e10;
    uint256 private constant PRECISION_1e18 = 1e18;
    uint256 private constant LIQUIDATION_RATIO_50 = 50;
    uint256 private constant LIQUIDATION_PRECISION_100 = 100;
    uint256 private constant MINIMUM_HEALTH_FACTOR_1e18 = 1e18;
    uint256 private constant LIQUIDATION_BONUS_10 = 10;

    DecentralizedStableCoin private immutable i_dsc;

    // ============
    //   Storage
    // ============

    mapping(address collateralToken => address priceFeed) private s_priceFeeds;
    mapping(address user => mapping(address collateralToken => uint256 amount))
        private s_collateralDeposited;
    mapping(address user => uint256 dscMinted) private s_dscMinted;

    address[] private s_collateralTokens;

    // =============
    //   Modifiers
    // =============

    /**
     * @notice Ensures the provided amount is greater than zero.
     * @param amount The amount to validate.
     */
    modifier onlyAmountMoreThanZero(uint256 amount) {
        if (amount <= 0) {
            revert DSCEngine__AmountMustBeMoreThanZero();
        }
        _;
    }

    /**
     * @notice Ensures the provided token is supported as collateral.
     * @param collateralToken The token address to validate.
     */
    modifier onlyAllowedToken(address collateralToken) {
        if (s_priceFeeds[collateralToken] == address(0)) {
            revert DSCEngine__NotTheAllowedToken();
        }
        _;
    }

    // ===============
    //   Constructor
    // ===============

    /**
     * @param collateralTokens List of supported collateral token addresses.
     * @param priceFeedAddresses List of Chainlink price feed addresses corresponding to each collateral token.
     * @param dscAddress Address of the DecentralizedStableCoin contract.
     * @notice Initializes the engine with supported collateral tokens, their price feeds, and the DSC token contract.
     * @dev The collateral token list and price feed list must have the same length.
     */
    constructor(
        address[] memory collateralTokens,
        address[] memory priceFeedAddresses,
        address dscAddress
    ) {
        if (collateralTokens.length != priceFeedAddresses.length) {
            revert DSCEngine__TheAddressListLengthNotMatch();
        }

        s_collateralTokens = collateralTokens;

        for (uint256 i = 0; i < collateralTokens.length; i++) {
            s_priceFeeds[collateralTokens[i]] = priceFeedAddresses[i];
        }

        i_dsc = DecentralizedStableCoin(dscAddress);
    }

    // ==============================
    //   External / Public Actions
    // ==============================

    /**
     * @param collateralToken The address of the collateral token to deposit.
     * @param collateralAmount The amount of collateral to deposit.
     * @notice Deposits approved collateral into the protocol.
     * @dev The token must be an allowed collateral asset. The function updates storage,
     * emits an event, and then transfers collateral from the user into the contract.
     */
    function depositCollateral(
        address collateralToken,
        uint256 collateralAmount
    )
        public
        override
        onlyAmountMoreThanZero(collateralAmount)
        onlyAllowedToken(collateralToken)
        nonReentrant
    {
        s_collateralDeposited[msg.sender][collateralToken] += collateralAmount;

        emit CollateralDeposited(msg.sender, collateralToken, collateralAmount);

        bool success = IERC20(collateralToken).transferFrom(
            msg.sender,
            address(this),
            collateralAmount
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }
    }

    /**
     * @param collateralToken The address of the collateral token to deposit.
     * @param collateralAmount The amount of collateral to deposit.
     * @param dscAmountToMint The amount of DSC to mint.
     * @notice Deposits collateral and mints DSC in a single transaction.
     * @dev This is a convenience wrapper that first deposits collateral and then mints DSC.
     */
    function depositCollateralAndMintDsc(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToMint
    ) public override {
        depositCollateral(collateralToken, collateralAmount);
        mintDsc(dscAmountToMint);
    }

    /**
     * @param dscAmountToMint The amount of DSC to mint.
     * @notice Mints DSC against the caller's deposited collateral.
     * @dev The user's minted DSC balance is increased first, then the health factor
     * is checked, and only afterward is the DSC token actually minted.
     */
    function mintDsc(uint256 dscAmountToMint) public override {
        s_dscMinted[msg.sender] += dscAmountToMint;

        _revertIfHealthFactorIsBroken(msg.sender);

        bool success = i_dsc.mint(msg.sender, dscAmountToMint);

        if (!success) {
            revert DSCEngine__MintFailed();
        }
    }

    /**
     * @param dscAmountToBurn The amount of DSC to burn.
     * @notice Burns DSC and reduces the caller's outstanding minted balance.
     * @dev The DSC is first transferred from the user into the contract and then burned.
     * A health factor check is performed afterward, although burning DSC should only improve solvency.
     */
    function burnDsc(
        uint256 dscAmountToBurn
    ) public override onlyAmountMoreThanZero(dscAmountToBurn) {
        _burnDsc(dscAmountToBurn, msg.sender, msg.sender);
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param collateralToken The address of the collateral token to redeem.
     * @param collateralAmount The amount of collateral to redeem.
     * @notice Redeems deposited collateral from the protocol.
     * @dev After transferring the collateral out, the protocol checks that the user's
     * health factor is still above the minimum threshold.
     */
    function redeemCollateral(
        address collateralToken,
        uint256 collateralAmount
    ) public override onlyAmountMoreThanZero(collateralAmount) nonReentrant {
        bool success = _redeemCollateral(
            collateralToken,
            collateralAmount,
            msg.sender,
            msg.sender
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param collateralToken The address of the collateral token to redeem.
     * @param collateralAmount The amount of collateral to redeem.
     * @param dscAmountToBurn The amount of DSC to burn.
     * @notice Burns DSC and redeems collateral in a single transaction.
     * @dev The function first burns the user's DSC, then redeems the specified collateral,
     * and finally checks that the user's health factor remains valid.
     */
    function redeemCollateralForDsc(
        address collateralToken,
        uint256 collateralAmount,
        uint256 dscAmountToBurn
    ) public override {
        burnDsc(dscAmountToBurn);

        _redeemCollateral(
            collateralToken,
            collateralAmount,
            msg.sender,
            msg.sender
        );

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param collateralToken The address of the collateral token to seize.
     * @param userToLiquidate The address of the undercollateralized user to liquidate.
     * @param debtToCover The amount of DSC debt the liquidator wants to cover.
     * @notice Liquidates a user whose health factor has fallen below the minimum threshold.
     * @dev The liquidator burns DSC to cover part of the unhealthy user's debt and receives
     * the corresponding collateral plus a liquidation bonus. The function reverts if:
     * - the target user's health factor is not below the minimum threshold
     * - the liquidation does not improve the user's health factor
     */
    function liquidate(
        address collateralToken,
        address userToLiquidate,
        uint256 debtToCover
    ) public override onlyAmountMoreThanZero(debtToCover) nonReentrant {
        uint256 startingUserHealthFactor = _healthFactor(userToLiquidate);

        if (startingUserHealthFactor >= MINIMUM_HEALTH_FACTOR_1e18) {
            revert DSCEngine__HealthFactorIsSafe(startingUserHealthFactor);
        }

        uint256 collateralAmountFromDebtCovered = getTokenAmountFromUsd(
            collateralToken,
            debtToCover
        );

        uint256 bonusCollateral = (collateralAmountFromDebtCovered *
            LIQUIDATION_BONUS_10) / LIQUIDATION_PRECISION_100;

        uint256 totalCollateralToRedeem = collateralAmountFromDebtCovered +
            bonusCollateral;

        _redeemCollateral(
            collateralToken,
            totalCollateralToRedeem,
            userToLiquidate,
            msg.sender
        );

        _burnDsc(debtToCover, userToLiquidate, msg.sender);

        uint256 endingUserHealthFactor = _healthFactor(userToLiquidate);

        if (endingUserHealthFactor <= startingUserHealthFactor) {
            revert DSCEngine__HealthFactorNotImproved();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    // ===========================
    //   Internal Core Actions
    // ===========================

    /**
     * @param dscAmountToBurn The amount of DSC to burn.
     * @param onBehalfOf The user whose minted DSC accounting will be reduced.
     * @param dscFrom The address that provides the DSC tokens to burn.
     * @notice Internal helper for burning DSC and reducing outstanding debt.
     * @dev This function:
     * 1. decreases the debt accounting for `onBehalfOf`
     * 2. transfers DSC from `dscFrom` to this contract
     * 3. burns the received DSC
     */
    function _burnDsc(
        uint256 dscAmountToBurn,
        address onBehalfOf,
        address dscFrom
    ) internal {
        s_dscMinted[onBehalfOf] -= dscAmountToBurn;

        bool success = IERC20(address(i_dsc)).transferFrom(
            dscFrom,
            address(this),
            dscAmountToBurn
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        i_dsc.burn(dscAmountToBurn);
    }

    /**
     * @param collateralToken The collateral token to redeem.
     * @param collateralAmount The amount of collateral to redeem.
     * @param from The address whose collateral balance will be reduced.
     * @param to The recipient of the redeemed collateral.
     * @return success Whether the collateral transfer succeeded.
     * @notice Internal helper for redeeming collateral from the protocol.
     * @dev Storage is updated before the ERC20 transfer is executed.
     */
    function _redeemCollateral(
        address collateralToken,
        uint256 collateralAmount,
        address from,
        address to
    ) internal returns (bool success) {
        s_collateralDeposited[from][collateralToken] -= collateralAmount;

        emit CollateralRedeemed(from, to, collateralToken, collateralAmount);

        success = IERC20(collateralToken).transfer(to, collateralAmount);
    }

    // =================================
    //   Internal Health Factor Logic
    // =================================

    /**
     * @param user The address of the user to query.
     * @return totalDscMinted The total amount of DSC minted by the user.
     * @return collateralValueInUsd The total USD value of the user's deposited collateral.
     * @notice Returns the user's debt and total collateral value.
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
     * @param user The address of the user to evaluate.
     * @notice Reverts if the user's health factor is below the minimum allowed threshold.
     * @dev Used as a protocol solvency check after state-changing operations.
     */
    function _revertIfHealthFactorIsBroken(address user) internal view {
        uint256 userHealthFactor = _healthFactor(user);

        if (userHealthFactor < MINIMUM_HEALTH_FACTOR_1e18) {
            revert DSCEngine__HealthFactorIsBroken(userHealthFactor);
        }
    }

    /**
     * @param user The address of the user to evaluate.
     * @return userHealthFactor The user's current health factor.
     * @notice Calculates the user's current health factor from debt and collateral value.
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
     * @param totalDscMinted The total amount of DSC minted by the user.
     * @param collateralValueInUsd The total USD value of the user's collateral.
     * @return userHealthFactor The calculated health factor.
     * @notice Computes a health factor from a user's debt and collateral position.
     * @dev If the user has minted no DSC, the function returns the maximum uint256 value.
     */
    function _calculateHealthFactor(
        uint256 totalDscMinted,
        uint256 collateralValueInUsd
    ) internal pure returns (uint256 userHealthFactor) {
        if (totalDscMinted == 0) return type(uint256).max;

        uint256 collateralAdjustedForThreshold = (collateralValueInUsd *
            LIQUIDATION_RATIO_50) / LIQUIDATION_PRECISION_100;

        userHealthFactor =
            (collateralAdjustedForThreshold * PRECISION_1e18) /
            totalDscMinted;
    }

    // ============================
    //   Public View / Getters
    // ============================

    /**
     * @param collateralToken The address of the collateral token.
     * @param usdAmountInWei The USD amount, scaled to 1e18.
     * @return collateralAmount The equivalent amount of collateral tokens.
     * @notice Converts a USD-denominated amount into the corresponding collateral token amount.
     * @dev Uses the configured Chainlink price feed for the collateral token.
     */
    function getTokenAmountFromUsd(
        address collateralToken,
        uint256 usdAmountInWei
    ) public view returns (uint256 collateralAmount) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeeds[collateralToken]
        );

        (, int256 price, , , ) = priceFeed.latestRoundData();

        collateralAmount =
            (usdAmountInWei * PRECISION_1e18) /
            uint256(price) /
            ADDITIONAL_FEED_PRECISION_1e10;
    }

    /**
     * @param collateralToken The address of the collateral token.
     * @return priceFeed The address of the associated Chainlink price feed.
     * @notice Returns the price feed configured for a collateral token.
     */
    function priceFeeds(
        address collateralToken
    ) public view returns (address priceFeed) {
        priceFeed = s_priceFeeds[collateralToken];
    }

    /**
     * @return dscAddress The address of the DSC token contract.
     * @notice Returns the address of the Decentralized StableCoin contract.
     */
    function dsc() public view returns (address dscAddress) {
        dscAddress = address(i_dsc);
    }

    /**
     * @param user The address of the user to query.
     * @return totalCollateralValueInUsd The total USD value of all collateral deposited by the user.
     * @notice Returns the total collateral value of a user, denominated in USD.
     * @dev Iterates across all supported collateral tokens and sums their USD values.
     */
    function getAccountCollateralValue(
        address user
    ) public view returns (uint256 totalCollateralValueInUsd) {
        for (uint256 i = 0; i < s_collateralTokens.length; i++) {
            address collateralToken = s_collateralTokens[i];
            uint256 collateralAmount = s_collateralDeposited[user][
                collateralToken
            ];
            totalCollateralValueInUsd += getUsdValue(
                collateralToken,
                collateralAmount
            );
        }
    }

    /**
     * @param collateralToken The address of the collateral token.
     * @param collateralAmount The amount of the collateral token.
     * @return usdValue The USD value of the given token amount, scaled to 1e18.
     * @notice Returns the USD value of a collateral token amount.
     * @dev Uses the token's Chainlink price feed and normalizes precision to 1e18.
     */
    function getUsdValue(
        address collateralToken,
        uint256 collateralAmount
    ) public view returns (uint256 usdValue) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            s_priceFeeds[collateralToken]
        );

        (, int256 price, , , ) = priceFeed.latestRoundData();

        usdValue =
            (uint256(price) *
                ADDITIONAL_FEED_PRECISION_1e10 *
                collateralAmount) /
            PRECISION_1e18;
    }

    /**
     * @param index The index in the supported collateral token list.
     * @return collateralToken The collateral token address at the given index.
     * @notice Returns a supported collateral token address by index.
     */
    function getTokenCollateralAddrList(
        uint256 index
    ) public view returns (address collateralToken) {
        collateralToken = s_collateralTokens[index];
    }

    /**
     * @param user The address of the user to query.
     * @return totalDscMinted The total amount of DSC minted by the user.
     * @return collateralValueInUsd The total USD value of the user's deposited collateral.
     * @notice Returns the user's debt and collateral information.
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
     * @param user The address of the user to query.
     * @return dscMinted The total amount of DSC minted by the user.
     * @notice Returns how much DSC a given user has minted.
     */
    function getDscMintedAmount(
        address user
    ) public view returns (uint256 dscMinted) {
        dscMinted = s_dscMinted[user];
    }

    /**
     * @param user The address of the user to query.
     * @return healthFactor The user's current health factor.
     * @notice Returns the current health factor of a user.
     */
    function getHealthFactor(
        address user
    ) public view returns (uint256 healthFactor) {
        healthFactor = _healthFactor(user);
    }

    /**
     * @return minimumHealthFactor The minimum allowed health factor.
     * @notice Returns the minimum health factor required by the protocol.
     */
    function getMinHealthFactor()
        external
        pure
        returns (uint256 minimumHealthFactor)
    {
        minimumHealthFactor = MINIMUM_HEALTH_FACTOR_1e18;
    }

    /**
     * @param user The address of the user to query.
     * @param collateralToken The address of the collateral token.
     * @return collateralAmount The amount of the specified collateral token deposited by the user.
     * @notice Returns a user's deposited balance for a given collateral token.
     */
    function getCollateralBalanceOfUser(
        address user,
        address collateralToken
    ) public view returns (uint256 collateralAmount) {
        collateralAmount = s_collateralDeposited[user][collateralToken];
    }
}
