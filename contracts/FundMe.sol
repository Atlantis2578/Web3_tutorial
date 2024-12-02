// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


//1.创建一个收款函数
//2.记录投资人并且查看
//3.在锁定期内，达到目标值，生产商可以提款
//4.在锁定期内，没有达到目标值，投资人在锁定期以后退款
contract FundMe{

    mapping (address => uint256) public funderToAmount;

    uint256 constant MIN_VALUE = 100 * 10 ** 18; //USD
    uint256 constant TARGET_VALUE = 200 * 10 ** 18; //USD

    address public owner;

    AggregatorV3Interface public dataFeed;

    uint256 deploymentTimestamp;
    uint256 lockTime;

    address erc20Addr;

    bool public fundSuccess = false;

    constructor(uint256 _lockTime, address dataFeedAddr){
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MIN_VALUE, "send more eth");
        require(block.timestamp < deploymentTimestamp + lockTime, "time out");
        funderToAmount[msg.sender] = msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
        /* uint80 roundID */,
            int answer,
        /*uint startedAt*/,
        /*uint timeStamp*/,
        /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function transferOwnership(address newOwner) external onlyOwner{
        owner = newOwner;
    }

    function getFund() external windowClose onlyOwner{
        require(convertEthToUsd(address(this).balance) >= TARGET_VALUE, "Target value not achieved");
        // payable (msg.sender).transfer(address(this).balance);
        bool success;
        (success, ) = payable (msg.sender).call{value: address(this).balance}("");
        require(success, "transfer fx failed");
        funderToAmount[msg.sender] = 0;
        fundSuccess = true;
    }

    function reFund() external windowClose{
        require(convertEthToUsd(address(this).balance)  < TARGET_VALUE, "Target value achieved");
        require(funderToAmount[msg.sender] != 0, "This money doesn't belong to you");
        bool success;
        (success, ) = payable (msg.sender).call{value: funderToAmount[msg.sender]}("");
        require(success, "transfer fx failed");
        funderToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amountoUpdate) external {
        require(msg.sender == erc20Addr, "you do not have permission to call this function");
        funderToAmount[funder] = amountoUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    modifier windowClose(){
        require(block.timestamp >= deploymentTimestamp + lockTime, "time out");
        _;
    }

    modifier onlyOwner(){
        require(owner == msg.sender, "This function can only be called by the owner");
        _;
    }

}