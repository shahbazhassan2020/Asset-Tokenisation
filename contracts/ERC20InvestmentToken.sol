// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC20 Investment Token
/// @notice This is the contract to tokenize any asset
contract ERC20InvestmentToken is ERC20, Ownable {
  uint8 immutable tokendecimals;

  mapping(address => uint256) public unlockedLimit;

  modifier NotAllowed() {
    require(1 == 2, "Not Allowed");
    _;
  }

  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals,
    address _to,
    uint256 _amount,
    uint256 _unlockedAmount
  ) ERC20(_name, _symbol) {
    tokendecimals = _decimals;

    unlockedLimit[_to] = _unlockedAmount;

    _mint(_to, _amount);
  }

  function decimals() public view override returns (uint8) {
    return tokendecimals;
  }

  function setUnlockLimit(
    address _tokenHolder,
    uint256 _unlockedTokens
  ) external onlyOwner {
    unlockedLimit[_tokenHolder] += _unlockedTokens;
  }

  function transfer(address to, uint256 amount) public override returns (bool) {
    require(
      amount <= unlockedLimit[msg.sender],
      "Amount Exceeds the Amount allowed to be transferred.Please contact admin."
    );
    address owner = _msgSender();
    unlockedLimit[owner] -= amount;
    _transfer(owner, to, amount);
    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) public override onlyOwner returns (bool) {
    _transfer(from, to, amount);
    return true;
  }

  function approve(
    address spender,
    uint256 amount
  ) public override NotAllowed returns (bool) {
    address owner = _msgSender();
    _approve(owner, spender, amount);
    return true;
  }

  function increaseAllowance(
    address spender,
    uint256 addedValue
  ) public override NotAllowed returns (bool) {
    address owner = _msgSender();
    _approve(owner, spender, allowance(owner, spender) + addedValue);
    return true;
  }

  function decreaseAllowance(
    address spender,
    uint256 subtractedValue
  ) public override NotAllowed returns (bool) {
    address owner = _msgSender();
    uint256 currentAllowance = allowance(owner, spender);
    require(
      currentAllowance >= subtractedValue,
      "ERC20: decreased allowance below zero"
    );
    unchecked {
      _approve(owner, spender, currentAllowance - subtractedValue);
    }

    return true;
  }
}
