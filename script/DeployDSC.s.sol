// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {DecentralizedStableCoin} from "../src/DecentralizedStableCoin.sol";
import {DSCEngine} from "../src/DSCEngine.sol";

contract DeployDSC is Script {
    address[] public tokenAddresses;
    address[] public priceFeedAddresses;

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
