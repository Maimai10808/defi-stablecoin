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
    error DSCEngine__AmountMustBeMoreThanZero();
    error DSCEngine__NotTheAllowedToken();
    error DSCEngine__TheAddressListLengthNotMatch();
    error DSCEngine_TransferFromFailed();
    error DSCEngine__HealthFactorIsBroken(uint256 userHealthFactor);
    error DSCEngine__MintFailed();
    error DSCEngine__HealthFactorIsSafe(uint256 userHealthFactor);
    error DSCEngine__HealthFactorNotImproved();

    uint256 private constant ADDITIONAL_FEED_PRECISION_1e10 = 1e10;
    uint256 private constant PRECISION_1e18 = 1e18;
    uint256 private constant LIQUIDATION_RATIO_50 = 50;
    uint256 private constant LIQUIDATION_PRECISION_100 = 100;
    uint256 private constant MINIMUM_HEALTH_FACTOR_1e18 = 1e18;
    uint256 private constant LIQUIDATION_BONUS_10 = 10;

    mapping(address token => address priceFeed) private s_priceFeedsMap;
    mapping(address user => mapping(address token => uint256 amount))
        private s_collateralDepositedMap;
    mapping(address user => uint256 amountDscMinted) private s_DscMintedMap;
    address[] private s_tokenCollateralAddrList;
    DecentralizedStableCoin private immutable i_dsc;

    ////////////////////
    //   Modifiers    //
    ////////////////////

    /**
     * @notice Ensures the provided amount is greater than zero.
     * @param _amount The amount to validate.
     */
    modifier onlyAmountMoreThanZero(uint256 _amount) {
        if (_amount <= 0) {
            revert DSCEngine__AmountMustBeMoreThanZero();
        }
        _;
    }

    /**
     * @notice Ensures the provided token is supported as collateral.
     * @param _tokenAddr The token address to validate.
     */
    modifier onlyAllowedToken(address _tokenAddr) {
        if (s_priceFeedsMap[_tokenAddr] == address(0)) {
            revert DSCEngine__NotTheAllowedToken();
        }
        _;
    }

    /**
     * @param tokenCollateralAddrList_ List of supported collateral token addresses.
     * @param priceFeedAddrList_ List of Chainlink price feed addresses corresponding to each collateral token.
     * @param DSCAddr_ Address of the DecentralizedStableCoin contract.
     * @notice Initializes the engine with supported collateral tokens, their price feeds, and the DSC token contract.
     * @dev The collateral token list and price feed list must have the same length.
     */
    constructor(
        address[] memory tokenCollateralAddrList_,
        address[] memory priceFeedAddrList_,
        address DSCAddr_
    ) {
        if (tokenCollateralAddrList_.length != priceFeedAddrList_.length) {
            revert DSCEngine__TheAddressListLengthNotMatch();
        }

        s_tokenCollateralAddrList = tokenCollateralAddrList_;

        for (uint256 i = 0; i < tokenCollateralAddrList_.length; i++) {
            s_priceFeedsMap[tokenCollateralAddrList_[i]] = priceFeedAddrList_[
                i
            ];
        }

        i_dsc = DecentralizedStableCoin(DSCAddr_);
    }

    /**
     * @param _tokenCollateralAddr The address of the collateral token to deposit.
     * @param _amountCollateral The amount of collateral to deposit.
     * @notice Deposits approved collateral into the protocol.
     * @dev The token must be an allowed collateral asset. The function updates storage,
     * emits an event, and then transfers collateral from the user into the contract.
     */
    function depositCollateral(
        address _tokenCollateralAddr,
        uint256 _amountCollateral
    )
        public
        override
        onlyAmountMoreThanZero(_amountCollateral)
        onlyAllowedToken(_tokenCollateralAddr)
        nonReentrant
    {
        s_collateralDepositedMap[msg.sender][
            _tokenCollateralAddr
        ] += _amountCollateral;

        emit CollateralDeposited(
            msg.sender,
            _tokenCollateralAddr,
            _amountCollateral
        );

        bool _success = IERC20(_tokenCollateralAddr).transferFrom(
            msg.sender,
            address(this),
            _amountCollateral
        );

        if (!_success) {
            revert DSCEngine_TransferFromFailed();
        }
    }

    /**
     * @param _acceptedToken The address of the collateral token to deposit.
     * @param _amountCollateral The amount of collateral to deposit.
     * @param _expectedMint The amount of DSC to mint.
     * @notice Deposits collateral and mints DSC in a single transaction.
     * @dev This is a convenience wrapper that first deposits collateral and then mints DSC.
     */
    function depositCollateralAndMintDsc(
        address _acceptedToken,
        uint256 _amountCollateral,
        uint256 _expectedMint
    ) public override {
        depositCollateral(_acceptedToken, _amountCollateral);
        mintDsc(_expectedMint);
    }

    /**
     * @param _expectedToken The address of the collateral token to redeem.
     * @param _expectedCollateralAmount The amount of collateral to redeem.
     * @param _amountToBurn The amount of DSC to burn.
     * @notice Burns DSC and redeems collateral in a single transaction.
     * @dev The function first burns the user's DSC, then redeems the specified collateral,
     * and finally checks that the user's health factor remains valid.
     */
    function redeemCollateralForDsc(
        address _expectedToken,
        uint256 _expectedCollateralAmount,
        uint256 _amountToBurn
    ) public override {
        burnDsc(_amountToBurn);

        _redeemCollateral(
            _expectedToken,
            _expectedCollateralAmount,
            msg.sender,
            msg.sender
        );

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param _expectedToken The address of the collateral token to redeem.
     * @param _expectedCollateralAmount The amount of collateral to redeem.
     * @notice Redeems deposited collateral from the protocol.
     * @dev After transferring the collateral out, the protocol checks that the user's
     * health factor is still above the minimum threshold.
     */
    function redeemCollateral(
        address _expectedToken,
        uint256 _expectedCollateralAmount
    )
        public
        override
        onlyAmountMoreThanZero(_expectedCollateralAmount)
        nonReentrant
    {
        bool success = _redeemCollateral(
            _expectedToken,
            _expectedCollateralAmount,
            msg.sender,
            msg.sender
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param _amountToBurn The amount of DSC to burn.
     * @notice Burns DSC and reduces the caller's outstanding minted balance.
     * @dev The DSC is first transferred from the user into the contract and then burned.
     * A health factor check is performed afterward, although burning DSC should only improve solvency.
     */
    function burnDsc(
        uint256 _amountToBurn
    ) public override onlyAmountMoreThanZero(_amountToBurn) {
        _burnDsc(_amountToBurn, msg.sender, msg.sender);
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param _collateral The address of the collateral token to seize.
     * @param _liquidatedUser The address of the undercollateralized user to liquidate.
     * @param _debtToCover The amount of DSC debt the liquidator wants to cover.
     * @notice Liquidates a user whose health factor has fallen below the minimum threshold.
     * @dev The liquidator burns DSC to cover part of the unhealthy user's debt and receives
     * the corresponding collateral plus a liquidation bonus. The function reverts if:
     * - the target user's health factor is not below the minimum threshold
     * - the liquidation does not improve the user's health factor
     */
    function liquidate(
        address _collateral,
        address _liquidatedUser,
        uint256 _debtToCover
    ) public override onlyAmountMoreThanZero(_debtToCover) nonReentrant {
        uint256 startingUserHealthFactor = _healthFactor(_liquidatedUser);

        if (startingUserHealthFactor >= MINIMUM_HEALTH_FACTOR_1e18) {
            revert DSCEngine__HealthFactorIsSafe(startingUserHealthFactor);
        }

        uint256 tokenAmountFromDebtCovered = getTokenAmountFromUsd(
            _collateral,
            _debtToCover
        );

        uint256 bonusCollateral = (tokenAmountFromDebtCovered *
            LIQUIDATION_BONUS_10) / LIQUIDATION_PRECISION_100;

        uint256 totalCollateralToRedeem = tokenAmountFromDebtCovered +
            bonusCollateral;

        _redeemCollateral(
            _collateral,
            totalCollateralToRedeem,
            _liquidatedUser,
            msg.sender
        );

        _burnDsc(_debtToCover, _liquidatedUser, msg.sender);

        uint256 endingUserHealthFactor = _healthFactor(_liquidatedUser);

        if (endingUserHealthFactor <= startingUserHealthFactor) {
            revert DSCEngine__HealthFactorNotImproved();
        }

        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * @param _expectedMint The amount of DSC to mint.
     * @notice Mints DSC against the caller's deposited collateral.
     * @dev The user's minted DSC balance is increased first, then the health factor
     * is checked, and only afterward is the DSC token actually minted.
     */
    function mintDsc(uint256 _expectedMint) public override {
        s_DscMintedMap[msg.sender] += _expectedMint;

        _revertIfHealthFactorIsBroken(msg.sender);

        bool _success = i_dsc.mint(msg.sender, _expectedMint);

        if (!_success) {
            revert DSCEngine__MintFailed();
        }
    }

    /**
     * @param _amountToBurn The amount of DSC to burn.
     * @param _onBehalfOf The user whose minted DSC accounting will be reduced.
     * @param _dscFrom The address that provides the DSC tokens to burn.
     * @notice Internal helper for burning DSC and reducing outstanding debt.
     * @dev This function:
     * 1. decreases the debt accounting for `_onBehalfOf`
     * 2. transfers DSC from `_dscFrom` to this contract
     * 3. burns the received DSC
     */
    function _burnDsc(
        uint256 _amountToBurn,
        address _onBehalfOf,
        address _dscFrom
    ) internal {
        s_DscMintedMap[_onBehalfOf] -= _amountToBurn;

        bool success = IERC20(address(i_dsc)).transferFrom(
            _dscFrom,
            address(this),
            _amountToBurn
        );

        if (!success) {
            revert DSCEngine_TransferFromFailed();
        }

        i_dsc.burn(_amountToBurn);
    }

    /**
     * @param _expectedToken The collateral token to redeem.
     * @param _expectedCollateralAmount The amount of collateral to redeem.
     * @param _from The address whose collateral balance will be reduced.
     * @param _to The recipient of the redeemed collateral.
     * @return _success Whether the collateral transfer succeeded.
     * @notice Internal helper for redeeming collateral from the protocol.
     * @dev Storage is updated before the ERC20 transfer is executed.
     */
    function _redeemCollateral(
        address _expectedToken,
        uint256 _expectedCollateralAmount,
        address _from,
        address _to
    ) internal returns (bool _success) {
        s_collateralDepositedMap[_from][
            _expectedToken
        ] -= _expectedCollateralAmount;

        emit CollateralRedeemed(
            _from,
            _to,
            _expectedToken,
            _expectedCollateralAmount
        );

        (_success) = IERC20(_expectedToken).transfer(
            _to,
            _expectedCollateralAmount
        );
    }

    /**
     * @param _user The address of the user to query.
     * @return _totalDscMinted The total amount of DSC minted by the user.
     * @return _CollateralValueInUsd The total USD value of the user's deposited collateral.
     * @notice Returns the user's debt and total collateral value.
     */
    function _getAccountInformation(
        address _user
    )
        internal
        view
        returns (uint256 _totalDscMinted, uint256 _CollateralValueInUsd)
    {
        _totalDscMinted = s_DscMintedMap[_user];
        _CollateralValueInUsd = getAccountCollateralValue(_user);
    }

    /**
     * @param _user The address of the user to evaluate.
     * @notice Reverts if the user's health factor is below the minimum allowed threshold.
     * @dev Used as a protocol solvency check after state-changing operations.
     */
    function _revertIfHealthFactorIsBroken(address _user) internal view {
        uint256 userHealthFactor = _healthFactor(_user);

        if (userHealthFactor < MINIMUM_HEALTH_FACTOR_1e18) {
            revert DSCEngine__HealthFactorIsBroken(userHealthFactor);
        }
    }

    /**
     * @param _user The address of the user to evaluate.
     * @return userHealthFactor The user's current health factor.
     * @notice Calculates the user's current health factor from debt and collateral value.
     */
    function _healthFactor(
        address _user
    ) internal view returns (uint256 userHealthFactor) {
        (
            uint256 _totalDscMinted,
            uint256 _CollateralValueInUsd
        ) = _getAccountInformation(_user);

        userHealthFactor = _calculateHealthFactor(
            _totalDscMinted,
            _CollateralValueInUsd
        );
    }

    /**
     * @param _totalDscMinted The total amount of DSC minted by the user.
     * @param _CollateralValueInUsd The total USD value of the user's collateral.
     * @return userHealthFactor The calculated health factor.
     * @notice Computes a health factor from a user's debt and collateral position.
     * @dev If the user has minted no DSC, the function returns the maximum uint256 value.
     */
    function _calculateHealthFactor(
        uint256 _totalDscMinted,
        uint256 _CollateralValueInUsd
    ) internal pure returns (uint256 userHealthFactor) {
        if (_totalDscMinted == 0) return type(uint256).max;

        uint256 collateralAdjustedForRatio = (_CollateralValueInUsd *
            LIQUIDATION_RATIO_50) / LIQUIDATION_PRECISION_100;

        userHealthFactor =
            (collateralAdjustedForRatio * PRECISION_1e18) /
            _totalDscMinted;
    }

    ////////////////////
    // Getter Methods //
    ////////////////////

    /**
     * @param _collateral The address of the collateral token.
     * @param _usdAmountInWei The USD amount, scaled to 1e18.
     * @return _amount The equivalent amount of collateral tokens.
     * @notice Converts a USD-denominated amount into the corresponding collateral token amount.
     * @dev Uses the configured Chainlink price feed for the collateral token.
     */
    function getTokenAmountFromUsd(
        address _collateral,
        uint256 _usdAmountInWei
    ) public view returns (uint256 _amount) {
        AggregatorV3Interface _priceFeed = AggregatorV3Interface(
            s_priceFeedsMap[_collateral]
        );

        (, int256 _price, , , ) = _priceFeed.latestRoundData();

        _amount =
            (_usdAmountInWei * PRECISION_1e18) /
            uint256(_price) /
            ADDITIONAL_FEED_PRECISION_1e10;
    }

    /**
     * @param _tokenAddr The address of the collateral token.
     * @return _priceFeed The address of the associated Chainlink price feed.
     * @notice Returns the price feed configured for a collateral token.
     */
    function priceFeeds(
        address _tokenAddr
    ) public view returns (address _priceFeed) {
        _priceFeed = s_priceFeedsMap[_tokenAddr];
    }

    /**
     * @return _dsc The address of the DSC token contract.
     * @notice Returns the address of the Decentralized StableCoin contract.
     */
    function dsc() public view returns (address _dsc) {
        _dsc = address(i_dsc);
    }

    /**
     * @param _user The address of the user to query.
     * @return _totalCollateralValueInUsd The total USD value of all collateral deposited by the user.
     * @notice Returns the total collateral value of a user, denominated in USD.
     * @dev Iterates across all supported collateral tokens and sums their USD values.
     */
    function getAccountCollateralValue(
        address _user
    ) public view returns (uint256 _totalCollateralValueInUsd) {
        for (uint256 i = 0; i < s_tokenCollateralAddrList.length; i++) {
            address _token = s_tokenCollateralAddrList[i];
            uint256 _amount = s_collateralDepositedMap[_user][_token];
            _totalCollateralValueInUsd += getUsdValue(_token, _amount);
        }
    }

    /**
     * @param _token The address of the collateral token.
     * @param _amount The amount of the collateral token.
     * @return _usdValue The USD value of the given token amount, scaled to 1e18.
     * @notice Returns the USD value of a collateral token amount.
     * @dev Uses the token's Chainlink price feed and normalizes precision to 1e18.
     */
    function getUsdValue(
        address _token,
        uint256 _amount
    ) public view returns (uint256 _usdValue) {
        AggregatorV3Interface _priceFeed = AggregatorV3Interface(
            s_priceFeedsMap[_token]
        );

        (, int256 _price, , , ) = _priceFeed.latestRoundData();

        _usdValue =
            (uint256(_price) * ADDITIONAL_FEED_PRECISION_1e10 * _amount) /
            PRECISION_1e18;
    }

    /**
     * @param _index The index in the supported collateral token list.
     * @return _collateral The collateral token address at the given index.
     * @notice Returns a supported collateral token address by index.
     */
    function getTokenCollateralAddrList(
        uint256 _index
    ) public view returns (address _collateral) {
        _collateral = s_tokenCollateralAddrList[_index];
    }

    /**
     * @param _user The address of the user to query.
     * @return _totalDscMinted The total amount of DSC minted by the user.
     * @return _CollateralValueInUsd The total USD value of the user's deposited collateral.
     * @notice Returns the user's debt and collateral information.
     */
    function getAccountInformation(
        address _user
    )
        public
        view
        returns (uint256 _totalDscMinted, uint256 _CollateralValueInUsd)
    {
        (_totalDscMinted, _CollateralValueInUsd) = _getAccountInformation(
            _user
        );
    }

    /**
     * @param _user The address of the user to query.
     * @return _amount The total amount of DSC minted by the user.
     * @notice Returns how much DSC a given user has minted.
     */
    function getDscMintedAmount(
        address _user
    ) public view returns (uint256 _amount) {
        _amount = s_DscMintedMap[_user];
    }

    /**
     * @param _user The address of the user to query.
     * @return healthFactor The user's current health factor.
     * @notice Returns the current health factor of a user.
     */
    function getHealthFactor(
        address _user
    ) public view returns (uint256 healthFactor) {
        healthFactor = _healthFactor(_user);
    }

    /**
     * @return _minimum The minimum allowed health factor.
     * @notice Returns the minimum health factor required by the protocol.
     */
    function getMinHealthFactor() external pure returns (uint256 _minimum) {
        _minimum = MINIMUM_HEALTH_FACTOR_1e18;
    }

    /**
     * @param _user The address of the user to query.
     * @param _token The address of the collateral token.
     * @return _amount The amount of the specified collateral token deposited by the user.
     * @notice Returns a user's deposited balance for a given collateral token.
     */
    function getCollateralBalanceOfUser(
        address _user,
        address _token
    ) public view returns (uint256 _amount) {
        _amount = s_collateralDepositedMap[_user][_token];
    }
}
