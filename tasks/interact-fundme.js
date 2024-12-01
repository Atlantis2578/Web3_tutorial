const { task } = require("hardhat/config")

task("interact-fundme", "interact with fundme contract")
    .addParam("addr", "fund me contract address")
    .setAction(async(taskArgs, hre) => {
    
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = fundMeFactory.attach(taskArgs.addr);

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
})