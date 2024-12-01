// import ethers.js
// create main function
    // init 2 accounts
    // fund contract with first account
    // check balance of contract
    // fund contract with second account
    // check balance of contract
    // check mapping funderToAmount
// execute main function

const { ethers, network} = require("hardhat")
const API_KEY = process.env.API_KEY;

async function main(){
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

    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();

    // fund contract with first account
    const fundTx = await fundMe.fund({value: ethers.parseEther("0.03")});
    await fundTx.wait();

    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
    console.log("Balance of the contract is" + balanceOfContract);

    // fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.03")});
    await fundTxWithSecondAccount.wait();

    // check balance of contract
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
    console.log("Balance of the contract is" + balanceOfContractAfterSecondFund);

    // check mapping funderToAmount
    const firstBalance = fundMe.funderToAmount(firstAccount.addres);
    const secondBalance = fundMe.funderToAmount(secondAccount.addres);
    console.log("Balance of first account" + firstAccount.addres + "is" + firstBalance);
    console.log("Balance of second account" + secondAccount.addres + "is" + secondBalance);
}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}

main().then().catch((error) => {
    console.error(error);
    process.exit(1);
})


