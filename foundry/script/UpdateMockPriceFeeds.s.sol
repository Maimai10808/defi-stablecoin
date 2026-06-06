// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";

contract UpdateMockPriceFeeds is Script {
    uint256 private constant FEED_PRECISION = 1e8;

    function run() external {
        address wethPriceFeed = vm.envAddress("WETH_PRICE_FEED");
        address wbtcPriceFeed = vm.envAddress("WBTC_PRICE_FEED");
        uint256 wethPrice = vm.envUint("WETH_PRICE");
        uint256 wbtcPrice = vm.envUint("WBTC_PRICE");
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);
        MockV3Aggregator(wethPriceFeed).updateAnswer(
            int256(wethPrice * FEED_PRECISION)
        );
        MockV3Aggregator(wbtcPriceFeed).updateAnswer(
            int256(wbtcPrice * FEED_PRECISION)
        );
        vm.stopBroadcast();

        console.log("WETH / USD:", wethPrice);
        console.log("WBTC / USD:", wbtcPrice);
    }
}
