// function deployFunction() {
// console.log("this is a deploy function")

const { network } = require("hardhat")
const { devlopmentChains, newtworkConfig, LOCK_TIME, CONFIRMATIONS } = require("../helper-hardhat-config")

const API_KEY = process.env.API_KEY;

// }

// module.exports.default = deployFunction
// module.exports = async(hre) => {
//     const getNamedAccounts = hre.getNamedAccounts
//     const deployments = hre.deployments
//     console.log("this is a deploy function")
// }

module.exports = async({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments

    let dataFeedAddr
    let confirmations
    if(devlopmentChains.includes(network.name)){
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
        confirmations = 0
    }else{
        dataFeedAddr = newtworkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }

    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: CONFIRMATIONS
    })
    // remove deployments directory or add --reset flag if you redeploy contract
    
    if(hre,network.config.chainId == 11155111 && API_KEY){
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
          });
    }else{
        console.log("Network is not sepolia, verification skipped...")
    }
}

module.exports.tags = ["all", "fundme"]