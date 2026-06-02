// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {DecentralizedStableCoin} from "../DecentralizedStableCoin.sol";
import {IDecentralizedStableCoin} from "../interface/IDecentralizedStableCoin.sol";
import {DSCEngineErrors} from "./DSCEngineErrors.sol";

abstract contract DSCEngineStorage is
    IDecentralizedStableCoin,
    DSCEngineErrors
{
    uint256 internal constant ADDITIONAL_FEED_PRECISION_1e10 = 1e10;
    uint256 internal constant PRECISION_1e18 = 1e18;
    uint256 internal constant LIQUIDATION_RATIO_50 = 50;
    uint256 internal constant LIQUIDATION_PRECISION_100 = 100;
    uint256 internal constant MINIMUM_HEALTH_FACTOR_1e18 = 1e18;
    uint256 internal constant LIQUIDATION_BONUS_10 = 10;

    DecentralizedStableCoin internal immutable i_dsc;

    mapping(address collateralToken => address priceFeed) internal s_priceFeeds;
    mapping(address user => mapping(address collateralToken => uint256 amount))
        internal s_collateralDeposited;
    mapping(address user => uint256 dscMinted) internal s_dscMinted;

    address[] internal s_collateralTokens;

    constructor(address dscAddress) {
        i_dsc = DecentralizedStableCoin(dscAddress);
    }

    modifier onlyAmountMoreThanZero(uint256 amount) {
        if (amount <= 0) {
            revert DSCEngine__AmountMustBeMoreThanZero();
        }
        _;
    }

    modifier onlyAllowedToken(address collateralToken) {
        if (s_priceFeeds[collateralToken] == address(0)) {
            revert DSCEngine__NotTheAllowedToken();
        }
        _;
    }
}
