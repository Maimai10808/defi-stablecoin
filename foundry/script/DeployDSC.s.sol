// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

import {HelperConfig} from "./HelperConfig.s.sol";
import {DecentralizedStableCoin} from "../src/DecentralizedStableCoin.sol";
import {DSCEngine} from "../src/DSCEngine.sol";

contract DeployDSC is Script {
    address[] public tokenAddresses;
    address[] public priceFeedAddresses;

    uint256 public constant LOCAL_USER_WETH_BALANCE = 100 ether;
    uint256 public constant LOCAL_USER_WBTC_BALANCE = 10 ether;

    uint256 public constant LOCAL_WETH_TO_DEPOSIT = 10 ether;
    uint256 public constant LOCAL_WBTC_TO_DEPOSIT = 1 ether;

    uint256 public constant LOCAL_DSC_TO_MINT = 5000 ether;

    function run()
        external
        returns (
            DecentralizedStableCoin dsc,
            DSCEngine dscEngine,
            HelperConfig helperConfig
        )
    {
        helperConfig = new HelperConfig();

        (
            address ethUsdPriceFeed,
            address btcUsdPriceFeed,
            address weth,
            address wbtc,
            uint256 deployerKey,
            address initOwner
        ) = helperConfig.activeNetworkConfig();

        tokenAddresses = [weth, wbtc];
        priceFeedAddresses = [ethUsdPriceFeed, btcUsdPriceFeed];

        console.log("ethUsdPriceFeed: %s", ethUsdPriceFeed);
        console.log("btcUsdPriceFeed: %s", btcUsdPriceFeed);
        console.log("weth: %s", weth);
        console.log("wbtc: %s", wbtc);
        console.log("initOwner: %s", initOwner);

        vm.startBroadcast(deployerKey);

        dsc = new DecentralizedStableCoin(initOwner);

        dscEngine = new DSCEngine(
            tokenAddresses,
            priceFeedAddresses,
            address(dsc)
        );

        dsc.transferOwnership(address(dscEngine));

        if (block.chainid == 31337) {
            _seedLocalDemoPosition(weth, wbtc, address(dscEngine), initOwner);
        }

        vm.stopBroadcast();

        console.log("dsc: %s", address(dsc));
        console.log("dscEngine: %s", address(dscEngine));

        _writeFrontendAddresses(
            ethUsdPriceFeed,
            btcUsdPriceFeed,
            weth,
            wbtc,
            address(dsc),
            address(dscEngine)
        );
    }

    function _seedLocalDemoPosition(
        address weth,
        address wbtc,
        address dscEngine,
        address user
    ) internal {
        ERC20Mock(weth).mint(user, LOCAL_USER_WETH_BALANCE);
        ERC20Mock(wbtc).mint(user, LOCAL_USER_WBTC_BALANCE);

        ERC20Mock(weth).approve(dscEngine, LOCAL_USER_WETH_BALANCE);
        ERC20Mock(wbtc).approve(dscEngine, LOCAL_USER_WBTC_BALANCE);

        DSCEngine(dscEngine).depositCollateral(weth, LOCAL_WETH_TO_DEPOSIT);

        DSCEngine(dscEngine).depositCollateral(wbtc, LOCAL_WBTC_TO_DEPOSIT);

        DSCEngine(dscEngine).mintDsc(LOCAL_DSC_TO_MINT);

        console.log("Local demo position seeded:");
        console.log("user: %s", user);
        console.log("wallet weth balance: %s", LOCAL_USER_WETH_BALANCE);
        console.log("wallet wbtc balance: %s", LOCAL_USER_WBTC_BALANCE);
        console.log("deposited weth: %s", LOCAL_WETH_TO_DEPOSIT);
        console.log("deposited wbtc: %s", LOCAL_WBTC_TO_DEPOSIT);
        console.log("minted dsc: %s", LOCAL_DSC_TO_MINT);
    }

    function _writeFrontendAddresses(
        address ethUsdPriceFeed,
        address btcUsdPriceFeed,
        address weth,
        address wbtc,
        address dsc,
        address dscEngine
    ) internal {
        string memory path = _getFrontendAddressPath();

        string memory obj = "root";
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "ethUsdPriceFeed", ethUsdPriceFeed);
        vm.serializeAddress(obj, "btcUsdPriceFeed", btcUsdPriceFeed);
        vm.serializeAddress(obj, "weth", weth);
        vm.serializeAddress(obj, "wbtc", wbtc);
        vm.serializeAddress(obj, "dsc", dsc);

        string memory finalJson = vm.serializeAddress(
            obj,
            "dscEngine",
            dscEngine
        );

        vm.writeJson(finalJson, path);

        console.log("Frontend addresses written to:");
        console.log(path);
    }

    function _getFrontendAddressPath() internal view returns (string memory) {
        if (block.chainid == 31337) {
            return "./web/lib/contracts/addresses/31337.json";
        }

        if (block.chainid == 11155111) {
            return "./web/lib/contracts/addresses/11155111.json";
        }

        revert("Unsupported chain for frontend sync");
    }
}
