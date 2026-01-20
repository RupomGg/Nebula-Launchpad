// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenVendor is Ownable, ReentrancyGuard {
    IERC20 public token;
    uint256 public price; // Wei per 1 Whole Token (1e18 uniits)
    address public platformFeeReceiver;

    event TokensPurchased(address indexed buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event TokensSold(address indexed seller, uint256 amountOfTokens, uint256 amountOfETH, uint256 fee);

    constructor(
        address _token,
        uint256 _price,
        address _platformFeeReceiver,
        address _creator
    ) Ownable(_creator) {
        token = IERC20(_token);
        price = _price;
        platformFeeReceiver = _platformFeeReceiver;
    }

    // Buy tokens with ETH
    // users send ETH, get tokens
    function buyTokens(uint256 tokenAmount) public payable nonReentrant {
        // Calculate cost: (amount * price) / 1e18
        uint256 cost = (tokenAmount * price) / 1e18;
        require(msg.value >= cost, "Insufficient ETH sent");

        uint256 vendorBalance = token.balanceOf(address(this));
        require(vendorBalance >= tokenAmount, "Vendor has insufficient tokens");

        bool sent = token.transfer(msg.sender, tokenAmount);
        require(sent, "Token transfer failed");

        // Refund excess ETH
        if (msg.value > cost) {
            (bool refundSent, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(refundSent, "Failed to refund");
        }

        emit TokensPurchased(msg.sender, cost, tokenAmount);
    }

    // Sell tokens for ETH
    function sellTokens(uint256 tokenAmount) public nonReentrant {
        require(tokenAmount > 0, "Amount must be greater than 0");
        
        uint256 revenue = (tokenAmount * price) / 1e18;
        uint256 fee = (revenue * 8) / 100; // 8% Fee
        uint256 payout = revenue - fee;

        require(address(this).balance >= revenue, "Insufficient Liquidity in Vendor");

        // Transfer tokens from user to vendor
        bool sent = token.transferFrom(msg.sender, address(this), tokenAmount);
        require(sent, "Token transfer failed");

        // Pay Fee
        if (fee > 0) {
            (bool keySent, ) = payable(platformFeeReceiver).call{value: fee}("");
            require(keySent, "Failed to send fee");
        }

        // Pay User
        (bool payoutSent, ) = payable(msg.sender).call{value: payout}("");
        require(payoutSent, "Failed to send payout");

        emit TokensSold(msg.sender, tokenAmount, payout, fee);
    }

    // Owner (Creator) can withdraw ETH (if permitted by logic)
    // IMPORTANT: If they withdraw all ETH, sells will fail (Rug pull risk?)
    // But requirement says "Withdraw button".
    function withdraw() public onlyOwner {
        (bool sent, ) = payable(owner()).call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }
}
