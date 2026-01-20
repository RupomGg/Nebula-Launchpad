// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./TokenVendor.sol";
import "./SimpleToken.sol";

contract LaunchpadFactory {
    address public implementation;
    address public platformFeeReceiver;

    event TokenLaunched(address indexed token, address indexed vendor, string name, string symbol, string metadataURI, address creator);

    constructor(address _implementation, address _platformFeeReceiver) {
        implementation = _implementation;
        platformFeeReceiver = _platformFeeReceiver;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint256 supply,
        uint256 initialPrice,
        string memory metadataURI
    ) external returns (address tokenAddress, address vendorAddress) {
        // 1. Calculate future address of Proxy? No, we need Proxy to call initialize.
        // But initialize needs Vendor address.
        // Cycle: Proxy needs Vendor (to mint to), Vendor needs Proxy (to know token).
        
        // Solution: 
        // 1. Deploy Proxy with empty init (or simple init).
        // 2. Deploy Vendor with Proxy address.
        // 3. Call `initialize` on Proxy with real data + Vendor address.

        // However, UUPS `initialize` usually runs in the proxy constructor (via `data`).
        // If we delay, anyone can front-run `initialize` and take ownership!
        // We MUST verify access or initialize atomically.
        
        // Better Approach:
        // Use a 2-step initialization or pre-compute address.
        
        // Predict Token address? No, predict Vendor address using CREATE2?
        // Let's rely on `SimpleToken` having a `mintTo` function restricted to Factory?
        // Or `SimpleToken` copies: `initialize` DOES mint.
        
        // Create Proxy and Vendor
        
        // 1. Deploy Token (Proxy). Init mints to Factory.
        // Constructor args: (token, price, feeReceiver, creator)
        // We don't have token address yet!
        
        // Ok, brute force:
        // 1. Deploy Proxy (Token). Initialize it with `msg.sender` as owner temporarily?
        //    Or initialize with Factory as owner, then transfer?
        
        // Step 1: Deploy Token (Proxy)
        // Data to initialize: We'll call initialize LATER.
        // RISK: Front-running.
        // Mitigation: Deploy invalid proxy?
        // Correct way: `ERC1967Proxy` constructor takes `_data`.
        // We can't pass vendor if it doesn't exist.
        
        // Logic change in SimpleToken:
        // `initialize` mints to `msg.sender` (Factory)?
        // Then Factory approves Vendor?
        // Then Factory sends tokens to Vendor?
        // Yes!
        
        // 1. Deploy Token (Proxy). Init mints to Factory.
        bytes memory initData = abi.encodeWithSelector(
            SimpleToken.initialize.selector,
            name,
            symbol,
            supply,
            address(this), // Mint to Factory
            msg.sender, // Owner is Creator
            metadataURI
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(implementation, initData);
        tokenAddress = address(proxy);
        
        // 2. Deploy Vendor
        TokenVendor vendor = new TokenVendor(tokenAddress, initialPrice, platformFeeReceiver, msg.sender);
        vendorAddress = address(vendor);
        
        // 3. Transfer tokens from Factory to Vendor
        SimpleToken(payable(tokenAddress)).transfer(vendorAddress, supply);
        
        emit TokenLaunched(tokenAddress, vendorAddress, name, symbol, metadataURI, msg.sender);
    }
}
