// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract SeedLocalWalletBalances is Script {
    address public constant LOCAL_ACCOUNT_0 =
        0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address public constant LOCAL_ACCOUNT_1 =
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address public constant LOCAL_ACCOUNT_2 =
        0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address public constant LOCAL_ACCOUNT_3 =
        0x90F79bf6EB2c4f870365E785982E1f101E93b906;
    address public constant LOCAL_ACCOUNT_4 =
        0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
    address public constant LOCAL_ACCOUNT_5 =
        0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
    address public constant LOCAL_ACCOUNT_6 =
        0x976EA74026E726554dB657fA54763abd0C3a0aa9;
    address public constant LOCAL_ACCOUNT_7 =
        0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
    address public constant LOCAL_ACCOUNT_8 =
        0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;

    function seed(address weth, address wbtc, uint256 deployerKey) external {
        address[9] memory users = _getLocalUsers();
        uint256[9] memory wethAmounts = _getWethAmounts();
        uint256[9] memory wbtcAmounts = _getWbtcAmounts();

        vm.startBroadcast(deployerKey);

        for (uint256 i = 0; i < users.length; i++) {
            ERC20Mock(weth).mint(users[i], wethAmounts[i]);
            ERC20Mock(wbtc).mint(users[i], wbtcAmounts[i]);

            console.log("Local tokens seeded:");
            console.log("user: %s", users[i]);
            console.log("weth amount: %s", wethAmounts[i]);
            console.log("wbtc amount: %s", wbtcAmounts[i]);
        }

        vm.stopBroadcast();
    }

    function _getLocalUsers() internal pure returns (address[9] memory) {
        return [
            LOCAL_ACCOUNT_0,
            LOCAL_ACCOUNT_1,
            LOCAL_ACCOUNT_2,
            LOCAL_ACCOUNT_3,
            LOCAL_ACCOUNT_4,
            LOCAL_ACCOUNT_5,
            LOCAL_ACCOUNT_6,
            LOCAL_ACCOUNT_7,
            LOCAL_ACCOUNT_8
        ];
    }

    function _getWethAmounts() internal pure returns (uint256[9] memory) {
        return [
            uint256(100 ether),
            uint256(80 ether),
            uint256(65 ether),
            uint256(50 ether),
            uint256(35 ether),
            uint256(25 ether),
            uint256(18 ether),
            uint256(12 ether),
            uint256(7 ether)
        ];
    }

    function _getWbtcAmounts() internal pure returns (uint256[9] memory) {
        return [
            uint256(10 ether),
            uint256(8 ether),
            uint256(6 ether),
            uint256(5 ether),
            uint256(4 ether),
            uint256(3 ether),
            uint256(2 ether),
            uint256(1 ether),
            uint256(0.5 ether)
        ];
    }
}
