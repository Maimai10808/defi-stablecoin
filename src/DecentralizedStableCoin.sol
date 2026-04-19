// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20, ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DecentralizedStableCoin
 * @author Maimai
 * @notice ERC20 stablecoin token used by the DSC protocol.
 * @notice The token is designed to maintain a soft 1:1 peg with the US dollar.
 * @dev This contract is intended to be owned by the DSCEngine contract.
 * All supply expansion and contraction is controlled by the engine through
 * protocol-governed minting and burning.
 *
 * Protocol characteristics:
 * - Exogenously collateralized
 * - Algorithmically managed
 * - USD-pegged target value
 * - Crypto-backed
 */
contract DecentralizedStableCoin is ERC20Burnable, Ownable {
    // ============
    //    Errors
    // ============

    error DecentralizedStableCoin__AmountMustBeMoreThanZero();
    error DecentralizedStableCoin__BurnAmountExceedsBalance();
    error DecentralizedStableCoin__NotZeroAddress();

    // ===============
    //   Constructor
    // ===============

    /**
     * @param initialOwner The initial owner of the contract.
     * @notice Initializes the token contract with its name, symbol, and owner.
     * @dev The owner is expected to be the DSCEngine contract.
     */
    constructor(
        address initialOwner
    ) ERC20("DecentralizedStableCoin", "DSC") Ownable(initialOwner) {}

    // ==============================
    //   External / Public Actions
    // ==============================

    /**
     * @param dscAmountToBurn The amount of DSC to burn.
     * @notice Burns DSC from the owner's balance.
     * @dev Only the owner may call this function. In the intended architecture,
     * the owner is the DSCEngine contract.
     */
    function burn(uint256 dscAmountToBurn) public override onlyOwner {
        if (dscAmountToBurn == 0) {
            revert DecentralizedStableCoin__AmountMustBeMoreThanZero();
        }

        uint256 ownerBalance = balanceOf(msg.sender);
        if (dscAmountToBurn > ownerBalance) {
            revert DecentralizedStableCoin__BurnAmountExceedsBalance();
        }

        super.burn(dscAmountToBurn);
    }

    /**
     * @param recipient The address that will receive the newly minted DSC.
     * @param dscAmountToMint The amount of DSC to mint.
     * @return success True if minting succeeds.
     * @notice Mints DSC to the specified recipient.
     * @dev Only the owner may call this function. In the intended architecture,
     * the owner is the DSCEngine contract.
     */
    function mint(
        address recipient,
        uint256 dscAmountToMint
    ) external onlyOwner returns (bool success) {
        if (recipient == address(0)) {
            revert DecentralizedStableCoin__NotZeroAddress();
        }

        if (dscAmountToMint == 0) {
            revert DecentralizedStableCoin__AmountMustBeMoreThanZero();
        }

        _mint(recipient, dscAmountToMint);
        success = true;
    }
}
