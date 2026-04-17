// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {DeployDSC} from "../../script/DeployDSC.s.sol";
import {DSCEngine} from "../../src/DSCEngine.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {DecentralizedStableCoin} from "../../src/DecentralizedStableCoin.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {MockFailedMintDSC} from "../mocks/MockFailedMintDSC.sol";
import {MockV3Aggregator} from "../mocks/MockV3Aggregator.sol";

contract DSCEngineTest is Test {
    HelperConfig public helperConfig;
    DSCEngine public dscEngine;
    DecentralizedStableCoin public dsc;
    address public ethUsdPriceFeed;
    address public btcUsdPriceFeed;
    address public weth;
    address public wbtc;
    uint256 public deployerKey;
    address public user = makeAddr("user");
    uint256 public constant STARTING_BALANCE_100ether = 100 ether;
    uint256 public constant AMOUNT_COLLATERAL_10ether = 10 ether;
    address[] public tokenAddresses;
    address[] public priceFeedAddresses;
    uint256 private constant ADDITIONAL_FEED_PRECISION_1e10 = 1e10;
    uint256 private constant PRECISION_1e18 = 1e18;
    uint256 private constant LIQUIDATION_RATIO_50 = 50;
    uint256 private constant LIQUIDATION_PRECISION_100 = 100;
    uint256 private constant MINIMUM_HEALTH_FACTOR_1e18 = 1e18;
    uint256 private constant LIQUIDATION_BONUS_10 = 10;
    int256 public constant ETH_USD_PRICE_2000e8 = 2000e8;
    int256 public constant BTC_USD_PRICE_1000e8 = 1000e8;
    address public constant INITIAL_OWNER =
        0xF42f4b5cb102b3f5A180E08E6BA726c0179D172E;
    address public liquidator = makeAddr("liquidator");

    uint256 public constant LIQUIDATION_USER_MINTED_10000ether = 10000 ether;
    uint256 public constant LIQUIDATION_LIQUIDATOR_MINTED_5000ether =
        5000 ether;
    uint256 public constant LIQUIDATION_DEBT_TO_COVER_5000ether = 5000 ether;

    int256 public constant ETH_USD_PRICE_1000e8 = 1000e8;

    uint256 public constant LIQUIDATION_USER_MINTED_6000ether = 6000 ether;
    uint256 public constant LIQUIDATION_LIQUIDATOR_MINTED_2000ether =
        2000 ether;
    uint256 public constant LIQUIDATION_DEBT_TO_COVER_2000ether = 2000 ether;

    event CollateralDeposited(
        address indexed user,
        address tokenCollateralAddr,
        uint256 amountCollateral
    );
    event CollateralRedeemed(
        address indexed from,
        address indexed to,
        address tokenCollateralAddr,
        uint256 amountCollateral
    );

    constructor() {}

    modifier depositedCollateral() {
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL_10ether);
        dscEngine.depositCollateral(weth, AMOUNT_COLLATERAL_10ether);
        vm.stopPrank();
        _;
    }

    modifier mintDsc(uint256 _expectedDscMinted) {
        vm.startPrank(user);
        dscEngine.mintDsc(_expectedDscMinted);
        vm.stopPrank();
        _;
    }

    modifier depositedCollateralAndMintedDsc() {
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL_10ether);
        dscEngine.depositCollateralAndMintDsc(
            weth,
            AMOUNT_COLLATERAL_10ether,
            STARTING_BALANCE_100ether
        );
        vm.stopPrank();
        _;
    }

    function setUp() external {
        DeployDSC deployer = new DeployDSC();
        (dsc, dscEngine, helperConfig) = deployer.run();
        (
            ethUsdPriceFeed,
            btcUsdPriceFeed,
            weth,
            wbtc,
            deployerKey,

        ) = helperConfig.activeNetworkConfig();

        if (block.chainid == 31337) {
            vm.deal(user, STARTING_BALANCE_100ether);
            vm.deal(liquidator, STARTING_BALANCE_100ether);
        }

        ERC20Mock(weth).mint(user, STARTING_BALANCE_100ether);
        ERC20Mock(wbtc).mint(user, STARTING_BALANCE_100ether);

        ERC20Mock(weth).mint(liquidator, STARTING_BALANCE_100ether);
        ERC20Mock(wbtc).mint(liquidator, STARTING_BALANCE_100ether);
    }

    function testConstructor_ShouldReverts_WhenListLenthIsNotEqual() public {
        tokenAddresses.push(weth);
        priceFeedAddresses.push(ethUsdPriceFeed);
        priceFeedAddresses.push(btcUsdPriceFeed);
        vm.expectRevert(
            DSCEngine.DSCEngine__TheAddressListLengthNotMatch.selector
        );
        new DSCEngine(tokenAddresses, priceFeedAddresses, address(dsc));
    }

    function testConstructor_ShouldSetsListCorrectly_WhenListLenthIsEqual()
        public
    {
        tokenAddresses.push(weth);
        tokenAddresses.push(wbtc);
        priceFeedAddresses.push(ethUsdPriceFeed);
        priceFeedAddresses.push(btcUsdPriceFeed);
        DSCEngine engine = new DSCEngine(
            tokenAddresses,
            priceFeedAddresses,
            address(dsc)
        );
        assertEq(engine.getTokenCollateralAddrList(0), weth);
        assertEq(engine.getTokenCollateralAddrList(1), wbtc);
        assertEq(engine.priceFeeds(weth), ethUsdPriceFeed);
        assertEq(engine.priceFeeds(wbtc), btcUsdPriceFeed);
    }

    function testGetUsdValue_ShouldCalculatesCorrectly_WhenParamsAreRight()
        public
    {
        uint256 amount = 1e18;
        uint256 expectedValue = (amount *
            uint256(ETH_USD_PRICE_2000e8) *
            ADDITIONAL_FEED_PRECISION_1e10) / PRECISION_1e18;
        uint256 actualValue = dscEngine.getUsdValue(weth, amount);
        assertEq(actualValue, expectedValue);
    }

    function testGetTokenAmountFromUsd_ShouldPasses_WhenConditionMatching()
        public
    {
        uint256 _usdAmountInWei = 1e18;
        uint256 expectedAmount = (_usdAmountInWei * PRECISION_1e18) /
            uint256(ETH_USD_PRICE_2000e8) /
            ADDITIONAL_FEED_PRECISION_1e10;
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            ethUsdPriceFeed
        );
        (, int256 _price, , , ) = priceFeed.latestRoundData();
        uint256 actualAmount = (_usdAmountInWei * PRECISION_1e18) /
            uint256(_price) /
            ADDITIONAL_FEED_PRECISION_1e10;
        assertEq(actualAmount, expectedAmount);
    }

    function testDepositCollateral_ShouldReverts_WhenAmountLessThanZero()
        public
    {
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL_10ether);
        vm.expectRevert(DSCEngine.DSCEngine__AmountMustBeMoreThanZero.selector);
        dscEngine.depositCollateral(weth, 0);
        vm.stopPrank();
    }

    function testDepositCollateral_ShouldReverts_WhenTokenIsNotAllowed()
        public
    {
        ERC20Mock unapprovedCollateral = new ERC20Mock();
        vm.startPrank(user);
        vm.expectRevert(DSCEngine.DSCEngine__NotTheAllowedToken.selector);
        dscEngine.depositCollateral(
            address(unapprovedCollateral),
            AMOUNT_COLLATERAL_10ether
        );
        vm.stopPrank();
    }

    function testDepositCollateral_ShouldEmitsCollateralDeposited_WhenConditionMatching()
        public
    {
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL_10ether);
        vm.expectEmit(true, false, false, false, address(dscEngine));
        emit CollateralDeposited(user, weth, AMOUNT_COLLATERAL_10ether);
        dscEngine.depositCollateral(weth, AMOUNT_COLLATERAL_10ether);
        vm.stopPrank();
    }

    function testDepositCollateral_ShouldGetAccountInfomation_WhenConditionMatching()
        public
        depositedCollateral
    {
        (uint256 _totalDscMinted, uint256 _CollateralValueInUsd) = dscEngine
            .getAccountInformation(user);
        assertEq(_totalDscMinted, 0);
        uint256 expectedCollateralValueInUsd = dscEngine.getTokenAmountFromUsd(
            weth,
            _CollateralValueInUsd
        );
        assertEq(AMOUNT_COLLATERAL_10ether, expectedCollateralValueInUsd);
    }

    function testDepositCollateralAndMintDsc_ShouldMints_WhenDeposited()
        public
    {
        uint256 expectedDscMinted = 10000 ether;
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL_10ether);
        dscEngine.depositCollateralAndMintDsc(
            weth,
            AMOUNT_COLLATERAL_10ether,
            expectedDscMinted
        );
        vm.stopPrank();
        assertEq(dscEngine.getDscMintedAmount(user), expectedDscMinted);
    }

    function testDepositCollateral_ShouldPasses_WhenNotMinted()
        public
        depositedCollateral
    {
        uint256 userBalance = dsc.balanceOf(user);
        assertEq(userBalance, 0);
    }

    function testMintDsc_ShouldChecksHealthFactor_WhenConditionMatching()
        public
        depositedCollateral
    {
        uint256 expectedDscMinted = 15000 ether;
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                DSCEngine.DSCEngine__HealthFactorIsBroken.selector,
                (((((uint256(2000e8) * ADDITIONAL_FEED_PRECISION_1e10) /
                    PRECISION_1e18) *
                    AMOUNT_COLLATERAL_10ether *
                    LIQUIDATION_RATIO_50) / LIQUIDATION_PRECISION_100) *
                    PRECISION_1e18) / expectedDscMinted
            )
        );
        dscEngine.mintDsc(expectedDscMinted);
        vm.stopPrank();
    }

    function testMintDsc_ShouldReverts_WhenSuccessIsFalse() public {
        MockFailedMintDSC mockFailedMintDsc = new MockFailedMintDSC(
            INITIAL_OWNER
        );
        tokenAddresses = [weth];
        priceFeedAddresses = [ethUsdPriceFeed];
        vm.startPrank(INITIAL_OWNER);
        DSCEngine _dscEngine = new DSCEngine(
            tokenAddresses,
            priceFeedAddresses,
            address(mockFailedMintDsc)
        );
        mockFailedMintDsc.transferOwnership(address(_dscEngine));
        vm.stopPrank();
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(_dscEngine), AMOUNT_COLLATERAL_10ether);
        vm.expectRevert(DSCEngine.DSCEngine__MintFailed.selector);
        _dscEngine.depositCollateralAndMintDsc(
            weth,
            AMOUNT_COLLATERAL_10ether,
            STARTING_BALANCE_100ether
        );
        vm.stopPrank();
    }

    function testGetUsdValue_ShouldPasses_WhenConditionMatching() public {
        uint256 expectedUsdValue = (uint256(ETH_USD_PRICE_2000e8) *
            ADDITIONAL_FEED_PRECISION_1e10 *
            AMOUNT_COLLATERAL_10ether) / PRECISION_1e18;
        vm.startPrank(user);
        uint256 _usdValue = dscEngine.getUsdValue(
            weth,
            AMOUNT_COLLATERAL_10ether
        );
        assertEq(expectedUsdValue, _usdValue);
    }

    function testRedeemCollateral_ShouldReverts_WhenAmountIsNotEnough() public {
        uint256 amount = 0;
        vm.expectRevert(DSCEngine.DSCEngine__AmountMustBeMoreThanZero.selector);
        dscEngine.redeemCollateral(weth, amount);
    }

    function testRedeemCollateral_ShouldEmits_WhenConditionMatching()
        public
        depositedCollateral
        mintDsc(AMOUNT_COLLATERAL_10ether)
    {
        uint256 expectedCollateralAmount = 1 ether;
        vm.startPrank(user);
        vm.expectEmit(true, true, false, false, address(dscEngine));
        emit CollateralRedeemed(user, user, weth, expectedCollateralAmount);
        dscEngine.redeemCollateral(weth, expectedCollateralAmount);
        vm.stopPrank();
    }

    function testRedeemCollateralForDsc_ShouldPasses_WithoutMintDsc() public {
        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL_10ether);
        dscEngine.depositCollateralAndMintDsc(
            weth,
            AMOUNT_COLLATERAL_10ether,
            STARTING_BALANCE_100ether
        );
        dsc.approve(address(dscEngine), STARTING_BALANCE_100ether);
        dscEngine.redeemCollateralForDsc(
            weth,
            AMOUNT_COLLATERAL_10ether,
            STARTING_BALANCE_100ether
        );
        vm.stopPrank();
        uint256 userBalance = dsc.balanceOf(user);
        assertEq(userBalance, 0);
    }

    // test Getters
    function testDsc_ShouldGetsCorrectly_WhenItConfigured() public {
        address expectedDsc = address(dsc);
        address realDsc = dscEngine.dsc();
        assertEq(expectedDsc, realDsc);
    }

    function testPriceFeeds_ShouldGetsCorrectly_WhenItConfigured() public {
        address wethRealAddr = dscEngine.priceFeeds(weth);
        address btcRealAddr = dscEngine.priceFeeds(wbtc);
        assertEq(ethUsdPriceFeed, wethRealAddr);
        assertEq(btcUsdPriceFeed, btcRealAddr);
    }

    function testGetTokenCollateralAddrList_ShouldGetsCorrectly_WhenItConfigured()
        public
    {
        address expectedWeth = dscEngine.getTokenCollateralAddrList(0);
        address expectedWbtc = dscEngine.getTokenCollateralAddrList(1);
        assertEq(weth, expectedWeth);
        assertEq(wbtc, expectedWbtc);
    }

    function testGetMinHealthFactor_ShouldGetsCorrectly_WhenItConfigured()
        public
    {
        uint256 expectedValue = dscEngine.getMinHealthFactor();
        assertEq(MINIMUM_HEALTH_FACTOR_1e18, expectedValue);
    }

    function testBurnDsc_ShouldReverts_WhenAmountIsNotEnough()
        public
        depositedCollateralAndMintedDsc
    {
        vm.startPrank(user);
        vm.expectRevert(DSCEngine.DSCEngine__AmountMustBeMoreThanZero.selector);
        dscEngine.burnDsc(0);
        vm.stopPrank();
    }

    function testBurnDsc_ShouldReverts_WhenBurnWithoutMinted() public {
        vm.startPrank(user);
        vm.expectRevert();
        dscEngine.burnDsc(AMOUNT_COLLATERAL_10ether);
        vm.stopPrank();
    }

    function testBurnDsc_ShouldResetsBalance_WhenBurnAllMinted()
        public
        depositedCollateralAndMintedDsc
    {
        vm.startPrank(user);
        dsc.approve(address(dscEngine), STARTING_BALANCE_100ether);
        dscEngine.burnDsc(STARTING_BALANCE_100ether);
        vm.stopPrank();
        uint256 userBalance = dsc.balanceOf(user);
        assertEq(userBalance, 0);
    }

    function _depositAndMint(
        address _actor,
        uint256 _collateralAmount,
        uint256 _mintAmount
    ) internal {
        vm.startPrank(_actor);
        ERC20Mock(weth).approve(address(dscEngine), _collateralAmount);
        dscEngine.depositCollateralAndMintDsc(
            weth,
            _collateralAmount,
            _mintAmount
        );
        vm.stopPrank();
    }

    function _updateEthPrice(int256 _newPrice) internal {
        MockV3Aggregator(ethUsdPriceFeed).updateAnswer(_newPrice);
    }

    function _prepareBrokenHealthFactorPosition() internal {
        _depositAndMint(
            user,
            AMOUNT_COLLATERAL_10ether,
            LIQUIDATION_USER_MINTED_6000ether
        );
        _updateEthPrice(ETH_USD_PRICE_1000e8);
    }

    function testCannotLiquidateIfHealthFactorIsSafe() public {
        _depositAndMint(
            user,
            AMOUNT_COLLATERAL_10ether,
            LIQUIDATION_USER_MINTED_6000ether
        );
        _depositAndMint(
            liquidator,
            AMOUNT_COLLATERAL_10ether,
            LIQUIDATION_LIQUIDATOR_MINTED_2000ether
        );

        vm.startPrank(liquidator);
        dsc.approve(address(dscEngine), LIQUIDATION_DEBT_TO_COVER_2000ether);

        vm.expectRevert(
            abi.encodeWithSelector(
                DSCEngine.DSCEngine__HealthFactorIsSafe.selector,
                dscEngine.getHealthFactor(user)
            )
        );

        dscEngine.liquidate(weth, user, LIQUIDATION_DEBT_TO_COVER_2000ether);
        vm.stopPrank();
    }

    function testLiquidationTransfersExactCollateralBonusAndBurnsExactDsc()
        public
    {
        _prepareBrokenHealthFactorPosition();
        _depositAndMint(
            liquidator,
            AMOUNT_COLLATERAL_10ether,
            LIQUIDATION_LIQUIDATOR_MINTED_2000ether
        );

        uint256 tokenAmountFromDebtCovered = dscEngine.getTokenAmountFromUsd(
            weth,
            LIQUIDATION_DEBT_TO_COVER_2000ether
        );
        uint256 bonusCollateral = (tokenAmountFromDebtCovered *
            LIQUIDATION_BONUS_10) / LIQUIDATION_PRECISION_100;
        uint256 expectedCollateralRedeemed = tokenAmountFromDebtCovered +
            bonusCollateral;

        uint256 userStartingMinted = dscEngine.getDscMintedAmount(user);
        uint256 userStartingCollateral = dscEngine.getCollateralBalanceOfUser(
            user,
            weth
        );
        uint256 liquidatorStartingDsc = dsc.balanceOf(liquidator);
        uint256 liquidatorStartingWeth = ERC20Mock(weth).balanceOf(liquidator);

        vm.startPrank(liquidator);
        dsc.approve(address(dscEngine), LIQUIDATION_DEBT_TO_COVER_2000ether);
        dscEngine.liquidate(weth, user, LIQUIDATION_DEBT_TO_COVER_2000ether);
        vm.stopPrank();

        uint256 userEndingMinted = dscEngine.getDscMintedAmount(user);
        uint256 userEndingCollateral = dscEngine.getCollateralBalanceOfUser(
            user,
            weth
        );
        uint256 liquidatorEndingDsc = dsc.balanceOf(liquidator);
        uint256 liquidatorEndingWeth = ERC20Mock(weth).balanceOf(liquidator);

        assertEq(
            userStartingMinted - userEndingMinted,
            LIQUIDATION_DEBT_TO_COVER_2000ether
        );
        assertEq(
            userStartingCollateral - userEndingCollateral,
            expectedCollateralRedeemed
        );
        assertEq(
            liquidatorStartingDsc - liquidatorEndingDsc,
            LIQUIDATION_DEBT_TO_COVER_2000ether
        );
        assertEq(
            liquidatorEndingWeth - liquidatorStartingWeth,
            expectedCollateralRedeemed
        );
    }

    function testLiquidationCanBringUserBackAboveMinimumHealthFactor() public {
        _prepareBrokenHealthFactorPosition();
        _depositAndMint(
            liquidator,
            AMOUNT_COLLATERAL_10ether,
            LIQUIDATION_LIQUIDATOR_MINTED_5000ether
        );

        vm.startPrank(liquidator);
        dsc.approve(address(dscEngine), LIQUIDATION_DEBT_TO_COVER_5000ether);
        dscEngine.liquidate(weth, user, LIQUIDATION_DEBT_TO_COVER_5000ether);
        vm.stopPrank();

        assertGe(dscEngine.getHealthFactor(user), MINIMUM_HEALTH_FACTOR_1e18);
    }

    function testLiquidationImprovesTargetHealthFactor() public {
        _prepareBrokenHealthFactorPosition();
        _depositAndMint(
            liquidator,
            AMOUNT_COLLATERAL_10ether,
            LIQUIDATION_LIQUIDATOR_MINTED_2000ether
        );

        uint256 startingHealthFactor = dscEngine.getHealthFactor(user);

        vm.startPrank(liquidator);
        dsc.approve(address(dscEngine), LIQUIDATION_DEBT_TO_COVER_2000ether);
        dscEngine.liquidate(weth, user, LIQUIDATION_DEBT_TO_COVER_2000ether);
        vm.stopPrank();

        uint256 endingHealthFactor = dscEngine.getHealthFactor(user);

        assertGt(endingHealthFactor, startingHealthFactor);
    }

    function testFuzz_GetUsdValueAndGetTokenAmountFromUsd_AreRoughlyInverse(
        uint96 amount
    ) public view {
        vm.assume(amount > 0);

        uint256 usdValue = dscEngine.getUsdValue(weth, uint256(amount));
        uint256 tokenAmount = dscEngine.getTokenAmountFromUsd(weth, usdValue);

        assertApproxEqAbs(tokenAmount, uint256(amount), 1);
    }

    function testFuzz_DepositCollateral_IncreasesUserBalance(uint96 amount)
        public
    {
        vm.assume(amount > 0);
        vm.assume(uint256(amount) <= STARTING_BALANCE_100ether);

        vm.startPrank(user);
        ERC20Mock(weth).approve(address(dscEngine), uint256(amount));
        dscEngine.depositCollateral(weth, uint256(amount));
        vm.stopPrank();

        assertEq(dscEngine.getCollateralBalanceOfUser(user, weth), amount);
    }
}
