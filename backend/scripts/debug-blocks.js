const hre = require("hardhat");

const FACTORY_ADDRESS = "0x55bf0507ff847f4f38Fe18EcAf6Ee1ADcC012a9c";

async function main() {
  const provider = hre.ethers.provider;
  
  // 1. Get Code to ensure it exists
  const code = await provider.getCode(FACTORY_ADDRESS);
  if (code === "0x") {
    console.log("Error: No contract found at address!");
    return;
  }
  console.log("Contract exists.");

  // 2. Get Current Block
  const currentBlock = await provider.getBlockNumber();
  console.log("Current Block:", currentBlock);

  // 3. Try to find deployment block (optional, hard to do without history API)
  // Instead, let's fetch events with a smaller range from current backwards
  const LaunchpadFactory = await hre.ethers.getContractFactory("LaunchpadFactory");
  const factory = LaunchpadFactory.attach(FACTORY_ADDRESS);

  // Search last 5000 blocks
  const startBlock = currentBlock - 10000;
  console.log(`Searching events from block ${startBlock} to ${currentBlock}...`);
  
  const events = await factory.queryFilter("TokenLaunched", startBlock, currentBlock);
  console.log(`Found ${events.length} events in last 10000 blocks.`);
  
  if(events.length > 0) {
      console.log("Latest Token:", events[events.length - 1].args.name);
      console.log("Block Number:", events[events.length - 1].blockNumber);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
