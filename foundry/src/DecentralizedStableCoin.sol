// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {DecentralizedStableCoinValidation} from "./stablecoin/DecentralizedStableCoinValidation.sol";

contract DecentralizedStableCoin is
    ERC20Burnable,
    ERC20Permit,
    Ownable,
    DecentralizedStableCoinValidation
{
    constructor(
        address initialOwner
    )
        ERC20("DecentralizedStableCoin", "DSC")
        ERC20Permit("DecentralizedStableCoin")
        Ownable(initialOwner)
    {}

    function burn(uint256 dscAmountToBurn) public override onlyOwner {
        _validateAmountMoreThanZero(dscAmountToBurn);
        _validateBurnAmountNotExceedsBalance(
            dscAmountToBurn,
            balanceOf(msg.sender)
        );

        super.burn(dscAmountToBurn);
    }

    function mint(
        address recipient,
        uint256 dscAmountToMint
    ) external onlyOwner returns (bool success) {
        _validateNotZeroAddress(recipient);
        _validateAmountMoreThanZero(dscAmountToMint);

        _mint(recipient, dscAmountToMint);

        success = true;
    }
}
