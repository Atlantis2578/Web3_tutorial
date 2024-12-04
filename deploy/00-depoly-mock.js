const {DECIMAL, INITIAL_ANSWER, devlopmentChains} = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts, deployments}) => {
    console.log("00-depoly-mock")
    if(!devlopmentChains.includes(network.name)){
        console.log("environment is not local, mock contract deployment is skipped...")
        return;
    }
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments

    console.log("00-1")

    await deploy("MockV3Aggregator", {
        from: firstAccount,
        args: [DECIMAL, INITIAL_ANSWER],
        log: true
    })
    console.log("00-2")
}

module.exports.tags = ["all", "mock"]