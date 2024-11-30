// import ethers.js
// create main function
// execute main function

const { ethers} = require("hardhat")

async function main(){
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("contract deploying")
    // deploy contract from factory
    const fundMe = await fundMeFactory.deploy(10);
    await fundMe.waitForDeployment();
    console.log("contract has been deployed successfully, contract address is" + fundMe.target);
}

main().then().catch((error) => {
    console.error(error);
    process.exit(1);
})


