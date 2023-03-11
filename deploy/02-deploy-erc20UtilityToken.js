const {
  UTILITY_TOKEN_NAME,
  UTILITY_TOKEN_SYMBOL,
  UTILITY_TOKEN_DECIMALS,
} = require("../hardhat-helper-config")

module.exports.default = async (hre) => {
  const { deployments, getNamedAccounts } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const args = [
    UTILITY_TOKEN_NAME,
    UTILITY_TOKEN_SYMBOL,
    UTILITY_TOKEN_DECIMALS,
  ]

  const erc20TokenDeploy = await deploy("ERC20UtilityToken", {
    from: deployer,
    args: args,
    log: true,
  })

  log(`ERC20UtilityToken Deployed at address ${erc20TokenDeploy.address}`)
  log("-------------------")
}
