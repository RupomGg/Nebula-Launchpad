const hre = require("hardhat");

const FACTORY_ADDRESS = "0x55bf0507ff847f4f38Fe18EcAf6Ee1ADcC012a9c";

async function main() {
  const LaunchpadFactory = await hre.ethers.getContractFactory("LaunchpadFactory");
  const factory = LaunchpadFactory.attach(FACTORY_ADDRESS);

  // Fetch only the latest blocks to be fast
  const currentBlock = await hre.ethers.provider.getBlockNumber();
  const events = await factory.queryFilter("TokenLaunched", 10075000, currentBlock);

  console.log(`Found ${events.length} tokens.`);

  events.forEach((event) => {
    if(event.args.name === "Rango Coin" || event.args.name === "Rango") {
        console.log("\nFOUND IT! 🎯");
        console.log("Token Name:", event.args.name);
        console.log("Token Symbol:", event.args.symbol);
        console.log("Token Address:", event.args.token); 
        console.log("--------------------------------------------------");
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
