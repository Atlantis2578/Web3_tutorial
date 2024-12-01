const { task } = require("hardhat/config");

const API_KEY = process.env.API_KEY;

task("deploy-fundme", "deploy and verify fundme contract").setAction(async(taskArgs, hre) => {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("contract deploying")

    // deploy contract from factory
    const fundMe = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log("contract has been deployed successfully, contract address is" + fundMe.target);
    
    // verify fundme
    if(hre,network.config.chainId == 11155111 && API_KEY){
        console.log("Wainting for 2 confirmations")
        await fundMe.deploymentTransaction().wait(2);
        await verifyFundMe(fundMe.target, [300])
    } else{
        console.log("verification skipped..s")
    }
});

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}

module.exports = {}