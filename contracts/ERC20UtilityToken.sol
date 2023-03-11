// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20UtilityToken is ERC20, ERC20Burnable, Ownable {
  uint8 immutable tokendecimals;

  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) ERC20(_name, _symbol) {
    tokendecimals = _decimals;
  }

  /// Returns Decimal places for token
  function decimals() public view override returns (uint8) {
    return tokendecimals;
  }

  /// Mints Token
  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function burnFrom(address account, uint256 amount) public override onlyOwner {
    /*  _spendAllowance(account, _msgSender(), amount); */
    _burn(account, amount);
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) public override onlyOwner returns (bool) {
    /* address spender = _msgSender();
        _spendAllowance(from, spender, amount); */
    _transfer(from, to, amount);
    return true;
  }
}
