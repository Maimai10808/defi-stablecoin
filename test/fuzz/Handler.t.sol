// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {DSCEngine} from "../../src/DSCEngine.sol";
import {DecentralizedStableCoin} from "../../src/DecentralizedStableCoin.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract Handler is Test {
    DSCEngine public dsce;
    DecentralizedStableCoin public dsc;
    ERC20Mock public weth;
    ERC20Mock public wbtc;

    address[] public collateralTokens;

    uint256 public timesDepositIsCalled;

    constructor(
        DSCEngine _dsce,
        DecentralizedStableCoin _dsc,
        address _weth,
        address _wbtc
    ) {
        dsce = _dsce;
        dsc = _dsc;
        weth = ERC20Mock(_weth);
        wbtc = ERC20Mock(_wbtc);

        collateralTokens.push(_weth);
        collateralTokens.push(_wbtc);
    }

    function depositCollateral(uint256 collateralSeed, uint256 amount) public {
        address collateral = collateralTokens[
            collateralSeed % collateralTokens.length
        ];

        amount = bound(amount, 1, 100 ether);

        ERC20Mock(collateral).mint(msg.sender, amount);

        vm.startPrank(msg.sender);
        ERC20Mock(collateral).approve(address(dsce), amount);
        dsce.depositCollateral(collateral, amount);
        vm.stopPrank();

        timesDepositIsCalled++;
    }
}
