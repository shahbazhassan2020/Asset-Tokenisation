const {
  INVESTMENT_TOKEN_NAME,
  INVESTMENT_TOKEN_SYMBOL,
  INVESTMENT_TOKEN_DECIMALS,
  INVESTMENT_TOKEN_MINTED_TO,
  INVESTMENT_TOKEN_MINTED_AMOUNT,
  INVESTMENT_TOKEN_INITIAL_UNLOCKED_AMOUNT,
} = require("../hardhat-helper-config")

module.exports.default = async (hre) => {
  const { deployments, getNamedAccounts } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  let addressToMintTokens =
    INVESTMENT_TOKEN_MINTED_TO == "" ? deployer : INVESTMENT_TOKEN_MINTED_TO

  const args = [
    INVESTMENT_TOKEN_NAME,
    INVESTMENT_TOKEN_SYMBOL,
    INVESTMENT_TOKEN_DECIMALS,
    addressToMintTokens,
    INVESTMENT_TOKEN_MINTED_AMOUNT,
    INVESTMENT_TOKEN_INITIAL_UNLOCKED_AMOUNT,
  ]

  const erc20TokenDeploy = await deploy("ERC20InvestmentToken", {
    from: deployer,
    args: args,
    log: true,
  })

  log(
    `ERC20InvestmentToken Deployed at address ${erc20TokenDeploy.address} and tokens minted to address ${addressToMintTokens}`
  )
  log("-------------------")
}
