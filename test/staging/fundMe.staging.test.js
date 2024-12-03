const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { devlopmentChains } = require("../../helper-hardhat-config")

devlopmentChains.includes(network.name) 
? describe.skip 
: describe("test fundme contract", async function() {

    let fundMe
    let firstAccount

    beforeEach(async function(){
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })

    // test fund and getFund successfully
    it("fund and getFund successfully"), async function () {
        await fundMe.fund({value: ethers.parseEther("0.08")})
        // make sure window closed
        await new Promise(resolve => setTimeout(resolve, 61 * 1000))
        // make sure can get receipt
        const getFundTx = await fundMe.getFund()
        const getFundReceipt = await getFundTx.wait()
        expect(getFundReceipt)
            .to.be.emit(fundMe, "FundWithdrawByOwner")
            .withArgs(ethers.parseEther("0.08"))
    }

    // test fund and refund successfully
    it("fund and reFund successfully"), async function () {
        // make sure target no reached
        await fundMe.fund({value: ethers.parseEther("0.05")})
        // make sure window closed
        await new Promise(resolve => setTimeout(resolve, 61 * 1000))
        // make sure can get receipt
        const reFundTx = await fundMe.reFund()
        const reFundReceipt = await reFundTx.wait()
        expect(reFundReceipt)
            .to.be.emit(fundMe, "RefundByFunder")
            .withArgs(firstAccount, ethers.parseEther("0.05"))
    }

})