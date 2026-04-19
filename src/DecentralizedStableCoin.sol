// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DecentralizedStableCoin
 * @author Maimai
 * @notice ERC20 stablecoin token used by the DSC protocol.
 * @notice The token is designed to track a soft 1:1 peg with the US dollar.
 * @dev This contract is intended to be owned by the DSCEngine contract.
 * Supply expansion and contraction are fully controlled by the engine through
 * protocol-governed minting and burning operations.
 *
 * Protocol characteristics:
 * - Exogenously collateralized
 * - Algorithmically managed
 * - USD-pegged target value
 * - Crypto-backed
 */
contract DecentralizedStableCoin is ERC20Burnable, Ownable {
    error DecentralizedStableCoin__AmountMustBeMoreThanZero();
    error DecentralizedStableCoin__BurnAmountExceedsBalance();
    error DecentralizedStableCoin__NotZeroAddress();

    /**
     * @param _initialOwner The initial owner of the contract.
     * @notice Initializes the token contract with name, symbol, and owner.
     * @dev The owner is expected to be the DSCEngine contract.
     */
    constructor(
        address _initialOwner
    ) ERC20("DecentralizedStableCoin", "DSC") Ownable(_initialOwner) {}

    /**
     * @param _amount The amount of DSC to burn.
     * @notice Burns DSC from the owner's balance.
     * @dev Only the owner may call this function. In the intended architecture,
     * the owner is the DSCEngine contract.
     */
    function burn(uint256 _amount) public override onlyOwner {
        if (_amount == 0) {
            revert DecentralizedStableCoin__AmountMustBeMoreThanZero();
        }

        uint256 balance = balanceOf(msg.sender);
        if (_amount > balance) {
            revert DecentralizedStableCoin__BurnAmountExceedsBalance();
        }

        super.burn(_amount);
    }

    /**
     * @param _to The recipient of the newly minted DSC.
     * @param _amount The amount of DSC to mint.
     * @return True if minting succeeds.
     * @notice Mints DSC to the specified address.
     * @dev Only the owner may call this function. In the intended architecture,
     * the owner is the DSCEngine contract.
     */
    function mint(
        address _to,
        uint256 _amount
    ) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert DecentralizedStableCoin__NotZeroAddress();
        }

        if (_amount == 0) {
            revert DecentralizedStableCoin__AmountMustBeMoreThanZero();
        }

        _mint(_to, _amount);
        return true;
    }
}
