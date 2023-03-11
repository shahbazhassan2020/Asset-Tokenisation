const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { getNamedAccounts } = hre
const { ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {
  INVESTMENT_TOKEN_NAME,
  INVESTMENT_TOKEN_SYMBOL,
  INVESTMENT_TOKEN_DECIMALS,
  INVESTMENT_TOKEN_MINTED_TO,
  INVESTMENT_TOKEN_MINTED_AMOUNT,
  INVESTMENT_TOKEN_INITIAL_UNLOCKED_AMOUNT,
} = require("../hardhat-helper-config")

describe("Test Investment Token", function () {
  async function deployInvestmentTokenFixture() {
    const { deployer, user } = await getNamedAccounts()
    const ERC20InvestmentTokenContract = await ethers.getContractFactory(
      "ERC20InvestmentToken",
      deployer
    )

    let addressToMintTokens =
      INVESTMENT_TOKEN_MINTED_TO == "" ? deployer : INVESTMENT_TOKEN_MINTED_TO

    const ERC20InvestmentToken = await ERC20InvestmentTokenContract.deploy(
      INVESTMENT_TOKEN_NAME,
      INVESTMENT_TOKEN_SYMBOL,
      INVESTMENT_TOKEN_DECIMALS,
      addressToMintTokens,
      INVESTMENT_TOKEN_MINTED_AMOUNT,
      INVESTMENT_TOKEN_INITIAL_UNLOCKED_AMOUNT
    )

    await ERC20InvestmentToken.deployed()

    return { deployer, user, ERC20InvestmentToken }
  }

  describe("Test Constructor", function () {
    it("Token Name must be correctly set", async function () {
      const { deployer, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const nameFromContract = await ERC20InvestmentToken.name()

      assert.equal(nameFromContract, INVESTMENT_TOKEN_NAME)
    })

    it("Token Symbol must be correctly set", async function () {
      const { deployer, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const symbolFromContract = await ERC20InvestmentToken.symbol()

      assert.equal(symbolFromContract, INVESTMENT_TOKEN_SYMBOL)
    })

    it("Token Decimals must be correctly set", async function () {
      const { deployer, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const decimalsFromContract = await ERC20InvestmentToken.decimals()

      assert.equal(
        decimalsFromContract.toString(),
        INVESTMENT_TOKEN_DECIMALS.toString()
      )
    })

    it("Initial token amount should be correctly minted", async function () {
      const { deployer, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const tokenAmount = await ERC20InvestmentToken.balanceOf(deployer)

      assert.equal(
        tokenAmount.toString(),
        INVESTMENT_TOKEN_MINTED_AMOUNT.toString()
      )
    })

    it("Unlocked Amount should be correctly set ", async function () {
      const { deployer, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const unlockedAmount = await ERC20InvestmentToken.unlockedLimit(deployer)

      assert.equal(
        unlockedAmount.toString(),
        INVESTMENT_TOKEN_INITIAL_UNLOCKED_AMOUNT.toString()
      )
    })
  })

  describe("Test Transfer", function () {
    it("Can Tranfer To Another address", async function () {
      const { deployer, user, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const initialBalanceOfDeployer = await ERC20InvestmentToken.balanceOf(
        deployer
      )

      const amountTransferred = 100
      const transfer = await ERC20InvestmentToken.transfer(
        user,
        amountTransferred
      )
      await transfer.wait()

      const balanceOfUser = await ERC20InvestmentToken.balanceOf(user)
      const finalBalanceOfDeployer = await ERC20InvestmentToken.balanceOf(
        deployer
      )

      assert.equal(balanceOfUser, amountTransferred)
      assert.equal(
        initialBalanceOfDeployer.sub(amountTransferred).toString(),
        finalBalanceOfDeployer.toString()
      )
    })

    it("Cannot Transfer More than Unlocked Amount", async function () {
      const { deployer, user, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const initialBalanceOfDeployer = await ERC20InvestmentToken.balanceOf(
        deployer
      )

      const amountTransferred = INVESTMENT_TOKEN_INITIAL_UNLOCKED_AMOUNT + 1
      await expect(
        ERC20InvestmentToken.transfer(user, amountTransferred)
      ).to.be.revertedWith(
        "Amount Exceeds the Amount allowed to be transferred.Please contact admin."
      )
    })

    it("Only owner can transfer across accounts", async function () {
      const { deployer, user, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )
      /* Impersonate user Begins*/
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [user],
      })

      const signer = await ethers.getSigner(user)

      await expect(
        ERC20InvestmentToken.connect(signer).transferFrom(deployer, user, 10)
      ).to.be.revertedWith("Ownable: caller is not the owner")

      await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [user],
      })
      /* Impersonate user Ends*/
    })
  })

  describe("Unlocked Limit", function () {
    it("Unlocked Limit can be increased", async function () {
      const { deployer, user, ERC20InvestmentToken } = await loadFixture(
        deployInvestmentTokenFixture
      )

      const initialUnlockedLimit = await ERC20InvestmentToken.unlockedLimit(
        deployer
      )
      let increasedLimitBy = 200
      const increaseUnlockedLimit = await ERC20InvestmentToken.setUnlockLimit(
        deployer,
        increasedLimitBy
      )
      const finalUnlockedLimit = await ERC20InvestmentToken.unlockedLimit(
        deployer
      )
      assert.equal(
        initialUnlockedLimit.add(increasedLimitBy).toString(),
        finalUnlockedLimit.toString()
      )
    })
  })
})
