const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { getNamedAccounts } = hre
const { ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_DECIMALS,
  TOKEN_MINTED_AMOUNT,
} = require("../hardhat-helper-config")
describe("Test ERC20 Tokens", function () {
  /* Fixture To Deploy Contract */
  async function deployERC20Fixture() {
    const { deployer, user, user_2 } = await getNamedAccounts()

    const ERC20Token = await ethers.getContractFactory(
      "ERC20UtilityToken",
      deployer
    )

    const ERC20TokenContract = await ERC20Token.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_DECIMALS
    )

    await ERC20TokenContract.deployed()

    return { deployer, user, user_2, ERC20TokenContract }
  }

  /* Fixture To Deploy Contract And Mint Tokens */
  async function deployContractAndMintTokens() {
    const { deployer, user, user_2 } = await getNamedAccounts()

    const ERC20Token = await ethers.getContractFactory(
      "ERC20UtilityToken",
      deployer
    )

    const ERC20TokenContract = await ERC20Token.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_DECIMALS
    )

    await ERC20TokenContract.deployed()

    const amountOfTokensToBeMinted = TOKEN_MINTED_AMOUNT
    const mint = await ERC20TokenContract.mint(
      deployer,
      amountOfTokensToBeMinted
    )
    await mint.wait()

    return { deployer, user, user_2, ERC20TokenContract }
  }
  /* Fixture To Deploy Contract ,Mint Tokens and Approve 50% of token to other user*/
  async function deployContractMintTokensAndApprove() {
    const { deployer, user, user_2 } = await getNamedAccounts()

    const ERC20Token = await ethers.getContractFactory(
      "ERC20UtilityToken",
      deployer
    )

    const ERC20TokenContract = await ERC20Token.deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_DECIMALS
    )

    await ERC20TokenContract.deployed()

    const amountOfTokensToBeMinted = TOKEN_MINTED_AMOUNT
    const mint = await ERC20TokenContract.mint(
      deployer,
      amountOfTokensToBeMinted
    )
    await mint.wait()

    const amountOfTokenApproved = TOKEN_MINTED_AMOUNT / 2
    const approve = await ERC20TokenContract.approve(
      user,
      amountOfTokenApproved
    )

    const approveTx = await approve.wait()

    return { deployer, user, user_2, ERC20TokenContract }
  }

  /* Test Constructor */
  describe("Test Constructor", function () {
    it("Name is correctly set", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployERC20Fixture
      )
      const nameOfTokenFromContract = await ERC20TokenContract.name()
      assert.equal(nameOfTokenFromContract, TOKEN_NAME)
    })

    it("Symbol is correctly set", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployERC20Fixture
      )
      const symbolOfTokenFromContract = await ERC20TokenContract.symbol()
      assert.equal(symbolOfTokenFromContract, TOKEN_SYMBOL)
    })

    it("Decimal value is correctly set", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployERC20Fixture
      )

      const decimalValueOfToken = await ERC20TokenContract.decimals()
      assert.equal(decimalValueOfToken, TOKEN_DECIMALS)
    })
  })

  /* Test Miniting */
  describe("Test Mint Tokens", function () {
    it("Tokens can be minted to an account", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployERC20Fixture
      )

      const amountOfTokensToBeMinted = TOKEN_MINTED_AMOUNT
      const mint = await ERC20TokenContract.mint(
        deployer,
        amountOfTokensToBeMinted
      )
      await mint.wait()

      const balance = await ERC20TokenContract.balanceOf(deployer)

      assert(balance.toString(), TOKEN_MINTED_AMOUNT.toString())
    })
  })

  /* Test Burn */

  describe("Test Burn Tokens", function () {
    it("User Can Burn Tokens", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployContractAndMintTokens
      )

      const initialBalance = await ERC20TokenContract.balanceOf(deployer)

      const amountToBeBurned = 2096
      const burn = await ERC20TokenContract.burn(amountToBeBurned)

      const finalBalance = await ERC20TokenContract.balanceOf(deployer)

      assert.equal(
        finalBalance.add(amountToBeBurned).toString(),
        initialBalance.toString()
      )
    })
  })

  /* Test Transfer */
  describe("Test Transfer Tokens", function () {
    it("Tokens can be transferred to an account", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployContractAndMintTokens
      )

      const initialBalanceOfDeployer = await ERC20TokenContract.balanceOf(
        deployer
      )

      const amountOfTokenToBeTransferred = 4000
      const transfer = await ERC20TokenContract.transfer(
        user,
        amountOfTokenToBeTransferred
      )
      await transfer.wait()

      const finalBalanceOfDeployer = await ERC20TokenContract.balanceOf(
        deployer
      )

      const balanceOfUser = await ERC20TokenContract.balanceOf(user)

      assert.equal(
        finalBalanceOfDeployer.add(balanceOfUser).toString(),
        TOKEN_MINTED_AMOUNT.toString()
      )
    })

    it("Cannot Transfer More tokens than present in the account", async function () {
      const { deployer, user, user_2, ERC20TokenContract } = await loadFixture(
        deployContractAndMintTokens
      )

      const amountOfTokenToBeTransferred = TOKEN_MINTED_AMOUNT + 1

      await expect(
        ERC20TokenContract.transfer(user, amountOfTokenToBeTransferred)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance")
    })
  })
})
