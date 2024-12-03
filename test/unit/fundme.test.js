const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { devlopmentChains } = require("../../helper-hardhat-config")

!devlopmentChains.includes(network.name) 
? describe.skip 
: describe("test fundme contract", async function() {

    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let mockV3Aggregator

    beforeEach(async function(){
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })

    it("test if the owner is msg.sender", async function () {
        // const [firstAccount] = await ethers.getSigners(); 
        // const fundmeFactory = await ethers.getContractFactory("FundMe");
        // const fundMe = await fundmeFactory.deploy(180);
        await fundMe.waitForDeployment();
        // assert.equal((await fundMe.owner()), firstAccount.address);
        assert.equal((await fundMe.owner()), firstAccount);
    })

    it("test if the datafeed is assigned correctly", async function () {
        // const [firstAccount] = await ethers.getSigners();
        // const fundmeFactory = await ethers.getContractFactory("FundMe");
        // const fundMe = await fundmeFactory.deploy(180);
        await fundMe.waitForDeployment();
        // assert.equal((await fundMe.dataFeed()), "0x694AA1769357215DE4FAC081bf1f309aDC325306");
        assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address);
    })

    // fund, getFund, refund
    // unit test for fund
    // window open, value greater then minmum value, funder balance
    it("window closed, value grater than minimum, fund failed", async function () {
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // value is greater minmum value
        expect(fundMe.fund({value: ethers.parseEther("0.03")}))
            .to.be.revertedWith("window is colsed")
    })

    it("window open, value is less than minimum, fund failed", async function () {
        // value is greater minmum value
        expect(fundMe.fund({value: ethers.parseEther("0.01")}))
            .to.be.revertedWith("send more eth")
    })

    it("window open, value is greater minimum, fund success", async function () {
        // greater than minmum
        await fundMe.fund({value: ethers.parseEther("0.04")})
        const balance = await fundMe.funderToAmount(firstAccount)
        expect(balance).to.equal(ethers.parseEther("0.04"))
    })


    it("not onwer, window closed, target reached, getFund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({value: ethers.parseEther("0.1")})
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        expect(fundMeSecondAccount.getFund()).to.be.revertedWith("This function can only be called by the owner")
    })

    it("window open, target reached, getFund failed", async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        expect(fundMe.getFund()).to.be.revertedWith("window is not closed")
    })

    it("window closed, target not reached, getFund failed", async function () {
        await fundMe.fund({value: ethers.parseEther("0.04")})
        await helpers.time.increase(200)
        await helpers.mine()
        expect(fundMe.getFund()).to.be.revertedWith("Target value not achieved")  
    })

    it("window closed, target reached, getFund success", async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(200)
        await helpers.mine()
        expect(fundMe.getFund())
        .to.emit(fundMe, "FundWithdrawByOwner")
        .withArgs(ethers.parseEther("0.1"))
    })

    // refund
    // window colsed, targert not reached, funder has balance
    it("window open, target not reached, reFund failed", async function () {
        await fundMe.fund({value: ethers.parseEther("0.3")})
        expect(fundMe.reFund()).to.be.revertedWith("target not reached")
    })

    it("window closed, target reached, reFund failed", async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await helpers.time.increase(200)
        await helpers.mine()
        expect(fundMe.reFund()).to.be.revertedWith("target is reached")
    })

    it("window closed, target not reach, reFund success, funder does not has balance", async function () {
        await fundMe.fund({value: ethers.parseEther("0.04")})
        await helpers.time.increase(200)
        await helpers.mine()
        expect(fundMeSecondAccount.reFund())
        .to.be.revertedWith("there is no fund for you")
    })

    it("window closed, target not reach, funder has balance", async function () {
        await fundMe.fund({value: ethers.parseEther("0.05")})
        await helpers.time.increase(200)
        await helpers.mine()
        expect(fundMe.reFund())
        .to.emit(fundMe, "RefundByFunder")
        .withArgs(firstAccount, ethers.parseEther("0.05"))
    })

})